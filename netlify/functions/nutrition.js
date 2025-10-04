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

  try {
    const { ingredients, recipe } = JSON.parse(event.body || '{}');

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
  // Simple fallback using estimated values
  return {
    calories: ingredients.length * 80,
    macros: {
      protein: { amount: ingredients.length * 5, unit: 'g', daily: 10 },
      carbs: { amount: ingredients.length * 15, unit: 'g', daily: 15 },
      fat: { amount: ingredients.length * 3, unit: 'g', daily: 8 },
      fiber: { amount: ingredients.length * 2, unit: 'g', daily: 8 },
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
    healthScore: 60,
  };
}

