import axios from 'axios';

const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

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

    // Generate meal plan using Hugging Face
    const prompt = `Generate a ${days}-day meal plan with the following requirements:
- Dietary preference: ${dietary || 'none'}
- Budget: ${budget || 'moderate'}
- User preferences: ${preferences || 'balanced nutrition'}

Format the response as JSON with this structure:
{
  "mealPlan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": { "name": "", "calories": 0, "ingredients": [] },
        "lunch": { "name": "", "calories": 0, "ingredients": [] },
        "dinner": { "name": "", "calories": 0, "ingredients": [] },
        "snack": { "name": "", "calories": 0, "ingredients": [] }
      },
      "totalCalories": 0
    }
  ],
  "shoppingList": [],
  "estimatedCost": 0
}`;

    let mealPlan;
    
    if (HF_API_KEY) {
      try {
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${HF_MODEL}`,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 2000,
              temperature: 0.7,
              return_full_text: false,
            },
          },
          {
            headers: {
              'Authorization': `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Parse AI response
        const generatedText = response.data[0]?.generated_text || '';
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mealPlan = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response');
        }
      } catch (aiError) {
        console.error('AI generation failed, using template:', aiError);
        mealPlan = generateTemplateMealPlan(days, dietary, budget);
      }
    } else {
      mealPlan = generateTemplateMealPlan(days, dietary, budget);
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
      body: JSON.stringify({ error: 'Failed to generate meal plan', details: error.message }),
    };
  }
};

function generateTemplateMealPlan(days, dietary, budget) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTemplates = {
    breakfast: [
      { name: 'Oatmeal with Berries', calories: 350, ingredients: ['oats', 'berries', 'honey', 'milk'] },
      { name: 'Scrambled Eggs & Toast', calories: 400, ingredients: ['eggs', 'bread', 'butter', 'tomato'] },
      { name: 'Greek Yogurt Parfait', calories: 300, ingredients: ['yogurt', 'granola', 'berries', 'honey'] },
      { name: 'Avocado Toast', calories: 380, ingredients: ['bread', 'avocado', 'eggs', 'seasoning'] },
      { name: 'Smoothie Bowl', calories: 320, ingredients: ['banana', 'berries', 'yogurt', 'granola'] },
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', calories: 450, ingredients: ['chicken', 'lettuce', 'vegetables', 'dressing'] },
      { name: 'Quinoa Buddha Bowl', calories: 500, ingredients: ['quinoa', 'chickpeas', 'vegetables', 'tahini'] },
      { name: 'Turkey Sandwich', calories: 420, ingredients: ['bread', 'turkey', 'lettuce', 'tomato', 'cheese'] },
      { name: 'Vegetable Stir Fry', calories: 380, ingredients: ['rice', 'mixed vegetables', 'soy sauce', 'tofu'] },
      { name: 'Lentil Soup', calories: 350, ingredients: ['lentils', 'vegetables', 'broth', 'spices'] },
    ],
    dinner: [
      { name: 'Baked Salmon with Veggies', calories: 550, ingredients: ['salmon', 'broccoli', 'potatoes', 'lemon'] },
      { name: 'Chicken Curry with Rice', calories: 600, ingredients: ['chicken', 'rice', 'curry sauce', 'vegetables'] },
      { name: 'Pasta Primavera', calories: 520, ingredients: ['pasta', 'mixed vegetables', 'olive oil', 'parmesan'] },
      { name: 'Beef Tacos', calories: 580, ingredients: ['beef', 'tortillas', 'cheese', 'salsa', 'lettuce'] },
      { name: 'Vegetable Lasagna', calories: 490, ingredients: ['pasta', 'vegetables', 'cheese', 'tomato sauce'] },
    ],
    snack: [
      { name: 'Apple with Peanut Butter', calories: 200, ingredients: ['apple', 'peanut butter'] },
      { name: 'Mixed Nuts', calories: 180, ingredients: ['almonds', 'cashews', 'walnuts'] },
      { name: 'Hummus with Carrots', calories: 150, ingredients: ['hummus', 'carrots'] },
      { name: 'Protein Bar', calories: 220, ingredients: ['protein bar'] },
    ],
  };

  const mealPlan = [];
  let shoppingList = new Set();

  for (let i = 0; i < days; i++) {
    const day = {
      day: daysOfWeek[i],
      meals: {
        breakfast: mealTemplates.breakfast[i % mealTemplates.breakfast.length],
        lunch: mealTemplates.lunch[i % mealTemplates.lunch.length],
        dinner: mealTemplates.dinner[i % mealTemplates.dinner.length],
        snack: mealTemplates.snack[i % mealTemplates.snack.length],
      },
      totalCalories: 0,
    };

    day.totalCalories = Object.values(day.meals).reduce((sum, meal) => sum + meal.calories, 0);
    
    // Add ingredients to shopping list
    Object.values(day.meals).forEach(meal => {
      meal.ingredients.forEach(ing => shoppingList.add(ing));
    });

    mealPlan.push(day);
  }

  const costPerDay = budget === 'low' ? 8 : budget === 'high' ? 20 : 12;

  return {
    mealPlan,
    shoppingList: Array.from(shoppingList),
    estimatedCost: costPerDay * days,
    nutritionSummary: {
      avgCaloriesPerDay: Math.round(mealPlan.reduce((sum, d) => sum + d.totalCalories, 0) / days),
      balanceScore: 85,
    },
  };
}

async function enhanceMealPlan(plan) {
  // Add recipe IDs from TheMealDB where possible
  // This would match meal names to actual recipes
  return plan;
}

