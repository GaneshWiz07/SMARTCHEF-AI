import axios from 'axios';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  let ingredients = [];

  try {
    const body = JSON.parse(event.body || '{}');
    ingredients = body.ingredients;
    const recipe = body.recipe;

    if (!ingredients || ingredients.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Ingredients are required' }),
      };
    }

    let formattedNutrition;

    // Try Edamam API if credentials are available
    if (EDAMAM_APP_ID && EDAMAM_APP_KEY) {
      try {
        const nutritionData = await axios.post(
          `https://api.edamam.com/api/nutrition-details?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`,
          {
            title: recipe?.name || 'Custom Recipe',
            ingr: ingredients,
          }
        );

        const { calories, totalNutrients, totalDaily, dietLabels, healthLabels } = nutritionData.data;

        // Format nutrition response
        formattedNutrition = {
          calories: Math.round(calories || 0),
          macros: {
            protein: {
              amount: Math.round(totalNutrients?.PROCNT?.quantity || 0),
              unit: totalNutrients?.PROCNT?.unit || 'g',
              daily: Math.round(totalDaily?.PROCNT?.quantity || 0),
            },
            carbs: {
              amount: Math.round(totalNutrients?.CHOCDF?.quantity || 0),
              unit: totalNutrients?.CHOCDF?.unit || 'g',
              daily: Math.round(totalDaily?.CHOCDF?.quantity || 0),
            },
            fat: {
              amount: Math.round(totalNutrients?.FAT?.quantity || 0),
              unit: totalNutrients?.FAT?.unit || 'g',
              daily: Math.round(totalDaily?.FAT?.quantity || 0),
            },
            fiber: {
              amount: Math.round(totalNutrients?.FIBTG?.quantity || 0),
              unit: totalNutrients?.FIBTG?.unit || 'g',
              daily: Math.round(totalDaily?.FIBTG?.quantity || 0),
            },
          },
          vitamins: {
            vitaminA: Math.round(totalDaily?.VITA_RAE?.quantity || 0),
            vitaminC: Math.round(totalDaily?.VITC?.quantity || 0),
            vitaminD: Math.round(totalDaily?.VITD?.quantity || 0),
            calcium: Math.round(totalDaily?.CA?.quantity || 0),
            iron: Math.round(totalDaily?.FE?.quantity || 0),
          },
          dietLabels: dietLabels || [],
          healthLabels: healthLabels || [],
          healthScore: calculateHealthScore(totalDaily, healthLabels),
          source: 'edamam',
        };
      } catch (edamamError) {
        console.log('Edamam API error, using fallback:', edamamError.message);
        formattedNutrition = await getFallbackNutrition(ingredients);
      }
    } else {
      console.log('No Edamam credentials, using fallback estimates');
      formattedNutrition = await getFallbackNutrition(ingredients);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ nutrition: formattedNutrition }),
    };
  } catch (error) {
    console.error('Error in nutrition function:', error);
    // Use fallback as last resort
    const fallbackNutrition = await getFallbackNutrition(ingredients || []);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ nutrition: fallbackNutrition, source: 'fallback' }),
    };
  }
};

function calculateHealthScore(totalDaily, healthLabels) {
  let score = 50; // Base score
  
  // Bonus for good nutrients
  if (totalDaily.FIBTG?.quantity > 20) score += 15;
  if (totalDaily.PROCNT?.quantity > 30) score += 10;
  if (totalDaily.VITA_RAE?.quantity > 50) score += 10;
  if (totalDaily.VITC?.quantity > 50) score += 10;
  
  // Penalty for excessive nutrients
  if (totalDaily.FAT?.quantity > 100) score -= 15;
  if (totalDaily.CHOLE?.quantity > 100) score -= 10;
  if (totalDaily.NA?.quantity > 100) score -= 15;
  
  // Bonus for health labels
  if (healthLabels?.includes('Low-Sugar')) score += 10;
  if (healthLabels?.includes('Low-Sodium')) score += 10;
  if (healthLabels?.includes('High-Fiber')) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

async function getFallbackNutrition(ingredients) {
  // Improved fallback with better estimates based on typical recipes
  const ingredientCount = Array.isArray(ingredients) ? ingredients.length : 0;
  
  // Estimate based on typical ingredient counts
  // Most recipes have 8-15 ingredients and 300-600 calories
  const baseCalories = ingredientCount > 0 ? Math.min(ingredientCount * 45, 600) : 400;
  const baseProtein = ingredientCount > 0 ? Math.min(ingredientCount * 3, 35) : 20;
  const baseCarbs = ingredientCount > 0 ? Math.min(ingredientCount * 8, 60) : 40;
  const baseFat = ingredientCount > 0 ? Math.min(ingredientCount * 2, 25) : 15;
  
  // Calculate a variable health score based on ingredients
  let healthScore = calculateEstimatedHealthScore(ingredients, baseCalories, baseProtein, baseFat);
  
  return {
    calories: Math.round(baseCalories),
    macros: {
      protein: { 
        amount: Math.round(baseProtein), 
        unit: 'g', 
        daily: Math.round((baseProtein / 50) * 100) 
      },
      carbs: { 
        amount: Math.round(baseCarbs), 
        unit: 'g', 
        daily: Math.round((baseCarbs / 300) * 100) 
      },
      fat: { 
        amount: Math.round(baseFat), 
        unit: 'g', 
        daily: Math.round((baseFat / 78) * 100) 
      },
      fiber: { 
        amount: Math.round(ingredientCount * 1.5), 
        unit: 'g', 
        daily: Math.round((ingredientCount * 1.5 / 28) * 100) 
      },
    },
    vitamins: {
      vitaminA: 15,
      vitaminC: 20,
      vitaminD: 5,
      calcium: 10,
      iron: 12,
    },
    dietLabels: [],
    healthLabels: [],
    healthScore: healthScore,
  };
}

function calculateEstimatedHealthScore(ingredients, calories, protein, fat) {
  let score = 50; // Base score
  
  const ingredientsText = Array.isArray(ingredients) ? ingredients.join(' ').toLowerCase() : '';
  
  // Boost for healthy ingredients
  if (ingredientsText.includes('vegetable') || ingredientsText.includes('broccoli') || 
      ingredientsText.includes('spinach') || ingredientsText.includes('kale')) score += 15;
  if (ingredientsText.includes('chicken') || ingredientsText.includes('fish') || 
      ingredientsText.includes('salmon') || ingredientsText.includes('tuna')) score += 10;
  if (ingredientsText.includes('olive oil') || ingredientsText.includes('avocado')) score += 10;
  if (ingredientsText.includes('garlic') || ingredientsText.includes('ginger') || 
      ingredientsText.includes('turmeric')) score += 5;
  if (ingredientsText.includes('lemon') || ingredientsText.includes('lime')) score += 5;
  
  // Reduce for unhealthy ingredients
  if (ingredientsText.includes('sugar') || ingredientsText.includes('syrup')) score -= 10;
  if (ingredientsText.includes('butter') && ingredientsText.includes('cream')) score -= 10;
  if (ingredientsText.includes('fried') || ingredientsText.includes('deep fry')) score -= 15;
  if (ingredientsText.includes('bacon') || ingredientsText.includes('sausage')) score -= 5;
  
  // Adjust based on macros
  if (protein > 25) score += 10; // High protein
  if (fat > 30) score -= 5; // High fat
  if (calories < 400) score += 5; // Lower calorie
  if (calories > 700) score -= 10; // High calorie
  
  // Variety bonus (more ingredients = potentially healthier)
  const ingredientCount = Array.isArray(ingredients) ? ingredients.length : 0;
  if (ingredientCount > 10) score += 5;
  
  // Keep score in valid range
  return Math.max(30, Math.min(95, score));
}

