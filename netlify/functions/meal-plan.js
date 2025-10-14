import axios from 'axios';

// Using Groq's free API - fast, reliable, and free
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const { preferences, days = 7, budget, dietary } = JSON.parse(event.body || '{}');

    // Generate meal plan using AI API
    const dietaryPref = dietary || 'balanced';
    const budgetLevel = budget || 'moderate';
    
    const prompt = `Create a ${days}-day ${dietaryPref} meal plan with ${budgetLevel} budget. 

IMPORTANT: Use SPECIFIC meal names, not generic ones like "Healthy Breakfast". Be creative and specific!

For each day, provide:
- Breakfast (300-400 calories)
- Lunch (400-500 calories) 
- Dinner (500-600 calories)
- Snack (150-250 calories)

Format EXACTLY like this example:

Monday
🌅 breakfast
**** Scrambled Eggs with Spinach (350 cal)
1 cup spinach, 2 eggs, 1 tbsp olive oil, salt, pepper

🌞 lunch  
**** Quinoa Buddha Bowl (450 cal)
1 cup quinoa, 1/2 avocado, cherry tomatoes, cucumber, tahini dressing

🌙 dinner
**** Baked Salmon with Roasted Vegetables (550 cal)
4oz salmon, broccoli, carrots, sweet potato, lemon, herbs

🍎 snack
**** Greek Yogurt with Berries (200 cal)
1 cup Greek yogurt, 1/2 cup mixed berries, 1 tbsp honey

Continue this format for all ${days} days. Use different specific meals each day!`;

    if (!GROQ_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Groq API key not configured. Please add GROQ_API_KEY to environment variables.' }),
      };
    }

    let mealPlan;
    let generatedText = '';
    
    try {
      console.log('Generating meal plan with Groq API...');
      console.log('Prompt length:', prompt.length);
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful nutritionist and meal planning expert. Create detailed, practical meal plans with specific foods, calorie counts, and ingredients.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
          top_p: 0.9,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      
      console.log('Groq API response status:', response.status);
      console.log('Response data keys:', Object.keys(response.data));
      
      if (response.data.choices && response.data.choices[0]) {
        generatedText = response.data.choices[0].message.content;
        console.log('Groq response received, length:', generatedText.length);
      } else {
        throw new Error('Invalid response format from Groq API');
      }
      
    } catch (groqError) {
      console.error('Groq API failed:', groqError.message);
      if (groqError.response) {
        console.error('Error response status:', groqError.response.status);
        console.error('Error response data:', groqError.response.data);
      }
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Groq API failed',
          details: groqError.message,
          response: groqError.response?.data,
          suggestion: 'Please check your Groq API key and try again'
        }),
      };
    }

    console.log('Generated text sample:', generatedText.substring(0, 500));
    console.log('Full AI response:', generatedText);

    // Parse AI text response and structure it as meal plan
    mealPlan = parseAIResponseToMealPlan(generatedText, days, dietary, budget);
    console.log('Successfully created meal plan from AI response');
    console.log('Parsed meal plan:', JSON.stringify(mealPlan, null, 2));

    // Validate meal plan structure
    if (!mealPlan || !mealPlan.mealPlan || !Array.isArray(mealPlan.mealPlan)) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid meal plan structure generated',
          suggestion: 'Please try again'
        }),
      };
    }

    // Enhance meal plan with TheMealDB recipes
    const enhancedPlan = await enhanceMealPlan(mealPlan);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(enhancedPlan),
    };
  } catch (error) {
    console.error('Error generating meal plan:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate meal plan',
        details: error.message,
        suggestion: 'Please try again or check if the AI service is available'
      }),
    };
  }
};

// Parse AI text response into structured meal plan
function parseAIResponseToMealPlan(text, days, dietary, budget) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  console.log('Parsing AI response...');
  console.log('Text length:', text.length);
  
  const mealPlan = [];
  const shoppingList = new Set();
  
  // Split by day patterns
  const daySections = text.split(/(?=Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
  
  for (let i = 0; i < Math.min(days, daySections.length); i++) {
    const daySection = daySections[i];
    if (!daySection.trim()) continue;
    
    const dayName = daysOfWeek[i];
    console.log(`Processing ${dayName}...`);
    
    // Extract meals from this day's section
    const meals = extractMealsFromDaySection(daySection, dayName);
    
    // Calculate total calories
    const totalCalories = Object.values(meals).reduce((sum, meal) => sum + (meal?.calories || 0), 0);
    
    // Add ingredients to shopping list
    Object.values(meals).forEach(meal => {
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ing => shoppingList.add(ing));
      }
    });
    
    mealPlan.push({
      day: dayName,
      meals,
      totalCalories,
    });
  }
  
  // Ensure we have enough days
  while (mealPlan.length < days) {
    const dayName = daysOfWeek[mealPlan.length];
    const defaultMeals = {
      breakfast: generateDefaultMeal('breakfast', dietary),
      lunch: generateDefaultMeal('lunch', dietary),
      dinner: generateDefaultMeal('dinner', dietary),
      snack: generateDefaultMeal('snack', dietary),
    };
    
    mealPlan.push({
      day: dayName,
      meals: defaultMeals,
      totalCalories: 1800,
    });
  }
  
  const costPerDay = budget === 'low' ? 8 : budget === 'high' ? 20 : 12;
  
  return {
    mealPlan: mealPlan.slice(0, days),
    shoppingList: Array.from(shoppingList),
    estimatedCost: costPerDay * days,
    nutritionSummary: {
      avgCaloriesPerDay: Math.round(
        mealPlan.reduce((sum, d) => sum + d.totalCalories, 0) / mealPlan.length
      ),
      balanceScore: 85,
    },
  };
}

function extractMealsFromDaySection(section, dayName) {
  const meals = {
    breakfast: null,
    lunch: null,
    dinner: null,
    snack: null,
  };
  
  // Look for meal patterns with emojis and asterisks
  const mealPatterns = [
    { type: 'breakfast', pattern: /🌅.*?breakfast.*?\*\*\*\* (.*?) \((\d+) cal\)/i },
    { type: 'lunch', pattern: /🌞.*?lunch.*?\*\*\*\* (.*?) \((\d+) cal\)/i },
    { type: 'dinner', pattern: /🌙.*?dinner.*?\*\*\*\* (.*?) \((\d+) cal\)/i },
    { type: 'snack', pattern: /🍎.*?snack.*?\*\*\*\* (.*?) \((\d+) cal\)/i },
  ];
  
  // Also try simpler patterns without asterisks
  const simplePatterns = [
    { type: 'breakfast', pattern: /🌅.*?breakfast.*?\n(.*?)\n(\d+) cal/i },
    { type: 'lunch', pattern: /🌞.*?lunch.*?\n(.*?)\n(\d+) cal/i },
    { type: 'dinner', pattern: /🌙.*?dinner.*?\n(.*?)\n(\d+) cal/i },
    { type: 'snack', pattern: /🍎.*?snack.*?\n(.*?)\n(\d+) cal/i },
  ];
  
  // Try both pattern types
  const allPatterns = [...mealPatterns, ...simplePatterns];
  
  for (const { type, pattern } of allPatterns) {
    const match = section.match(pattern);
    if (match) {
      const mealName = match[1].trim();
      const calories = parseInt(match[2]);
      
      // Extract ingredients from the line after the meal
      const lines = section.split('\n');
      let ingredients = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(mealName)) {
          // Look for ingredient list in next few lines
          for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
            const line = lines[j].trim();
            if (line && !line.includes('cal') && !line.includes('🌅') && !line.includes('🌞') && !line.includes('🌙') && !line.includes('🍎')) {
              // Extract ingredients from this line
              const lineIngredients = line
                .split(/[,\n]/)
                .map(ing => ing.trim())
                .filter(ing => ing.length > 2 && ing.length < 50)
                .slice(0, 5);
              ingredients.push(...lineIngredients);
            }
          }
          break;
        }
      }
      
      meals[type] = {
        name: mealName,
        calories,
        ingredients: ingredients.length > 0 ? ingredients : ['mixed ingredients'],
      };
      
      console.log(`Found ${type}: ${mealName} (${calories} cal)`);
    }
  }
  
  // Fill in missing meals with defaults
  Object.keys(meals).forEach(type => {
    if (!meals[type]) {
      console.log(`No ${type} found, using default`);
      meals[type] = generateDefaultMeal(type);
    }
  });
  
  return meals;
}

function extractMealInfo(text) {
  // Extract calories if present
  const calorieMatch = text.match(/(\d+)\s*(cal|kcal|calories)/i);
  const calories = calorieMatch ? parseInt(calorieMatch[1]) : estimateCalories(text);
  
  // Extract meal name
  const name = text
    .replace(/breakfast|lunch|dinner|snack/gi, '')
    .replace(/\d+\s*(cal|kcal|calories)/gi, '')
    .replace(/[:,-]/g, '')
    .trim()
    .substring(0, 50) || 'Meal';
  
  // Extract ingredients
  const ingredients = text
    .toLowerCase()
    .split(/,|and|with/)
    .map(i => i.trim())
    .filter(i => i.length > 2 && i.length < 30)
    .slice(0, 6);
  
  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    calories,
    ingredients: ingredients.length > 0 ? ingredients : ['mixed ingredients'],
  };
}

function createDayObject(dayName, dayMeals, shoppingList) {
  // Fill in missing meals
  const completeMeals = {
    breakfast: dayMeals.breakfast || generateDefaultMeal('breakfast'),
    lunch: dayMeals.lunch || generateDefaultMeal('lunch'),
    dinner: dayMeals.dinner || generateDefaultMeal('dinner'),
    snack: dayMeals.snack || generateDefaultMeal('snack'),
  };
  
  // Add ingredients to shopping list
  Object.values(completeMeals).forEach(meal => {
    if (meal && meal.ingredients) {
      meal.ingredients.forEach(ing => shoppingList.add(ing));
    }
  });
  
  const totalCalories = Object.values(completeMeals).reduce(
    (sum, meal) => sum + (meal?.calories || 0),
    0
  );
  
  return {
    day: dayName,
    meals: completeMeals,
    totalCalories,
  };
}

function generateDefaultMeal(type, dietary = 'balanced') {
  // Create more varied default meals based on dietary preference
  const mealVariations = {
    breakfast: [
      { name: 'Oatmeal with Berries', calories: 350, ingredients: ['oats', 'berries', 'milk'] },
      { name: 'Scrambled Eggs & Toast', calories: 380, ingredients: ['eggs', 'bread', 'butter'] },
      { name: 'Greek Yogurt Parfait', calories: 320, ingredients: ['yogurt', 'granola', 'honey'] },
      { name: 'Avocado Toast', calories: 400, ingredients: ['bread', 'avocado', 'eggs'] },
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 450, ingredients: ['chicken', 'lettuce', 'vegetables'] },
      { name: 'Quinoa Buddha Bowl', calories: 480, ingredients: ['quinoa', 'chickpeas', 'vegetables'] },
      { name: 'Turkey Sandwich', calories: 420, ingredients: ['bread', 'turkey', 'lettuce'] },
      { name: 'Vegetable Stir Fry', calories: 380, ingredients: ['rice', 'vegetables', 'tofu'] },
    ],
    dinner: [
      { name: 'Baked Salmon with Veggies', calories: 550, ingredients: ['salmon', 'broccoli', 'potatoes'] },
      { name: 'Chicken Curry with Rice', calories: 580, ingredients: ['chicken', 'rice', 'curry sauce'] },
      { name: 'Pasta Primavera', calories: 520, ingredients: ['pasta', 'vegetables', 'olive oil'] },
      { name: 'Beef Tacos', calories: 600, ingredients: ['beef', 'tortillas', 'cheese'] },
    ],
    snack: [
      { name: 'Apple with Peanut Butter', calories: 200, ingredients: ['apple', 'peanut butter'] },
      { name: 'Mixed Nuts', calories: 180, ingredients: ['almonds', 'cashews', 'walnuts'] },
      { name: 'Hummus with Carrots', calories: 150, ingredients: ['hummus', 'carrots'] },
      { name: 'Protein Bar', calories: 220, ingredients: ['protein bar'] },
    ],
  };
  
  const variations = mealVariations[type] || mealVariations.snack;
  // Return a random variation to add some variety
  return variations[Math.floor(Math.random() * variations.length)];
}

function estimateCalories(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('breakfast')) return 350;
  if (lowerText.includes('lunch')) return 450;
  if (lowerText.includes('dinner')) return 550;
  if (lowerText.includes('snack')) return 200;
  return 400;
}

async function enhanceMealPlan(plan) {
  // Add recipe IDs from TheMealDB where possible
  // This would match meal names to actual recipes
  return plan;
}

