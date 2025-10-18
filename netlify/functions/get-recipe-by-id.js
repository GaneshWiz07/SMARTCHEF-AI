import axios from 'axios';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function analyzeRecipeWithGroq(recipeName, ingredients, instructions) {
  if (!GROQ_API_KEY) {
    console.log('Groq API key not available, using estimates');
    return null;
  }

  try {
    const prompt = `Analyze this recipe and provide ONLY a JSON response with exact prep time, cook time, and servings.

Recipe: ${recipeName}

Ingredients:
${ingredients.map(ing => `- ${ing.measure} ${ing.name}`).join('\n')}

Instructions:
${instructions.substring(0, 500)}...

Respond with ONLY this JSON format, no other text:
{
  "prepTime": <number in minutes>,
  "cookTime": <number in minutes>,
  "servings": <number of people>
}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional chef analyzer. Always respond with ONLY valid JSON, no markdown, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content?.trim();
    
    // Remove markdown code blocks if present
    const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(jsonContent);
    
    console.log('✅ Groq analysis:', analysis);
    return {
      prepTime: parseInt(analysis.prepTime) || 15,
      cookTime: parseInt(analysis.cookTime) || 30,
      servings: parseInt(analysis.servings) || 4
    };
  } catch (error) {
    console.log('⚠️ Groq analysis failed:', error.message);
    return null;
  }
}

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
    const { id } = JSON.parse(event.body || '{}');
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Recipe ID is required' }),
      };
    }

    console.log(`Fetching recipe with ID: ${id}`);

    // Try to fetch from TheMealDB first (most recipes come from here)
    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );

      if (response.data.meals && response.data.meals.length > 0) {
        const recipe = response.data.meals[0];
        
        // Parse ingredients
        const ingredients = Object.keys(recipe)
          .filter(key => key.startsWith('strIngredient') && recipe[key])
          .map((key, index) => {
            const measure = recipe[`strMeasure${index + 1}`] || '';
            const ingredient = recipe[key];
            return {
              name: ingredient,
              measure: measure.trim()
            };
          });

        // Use Groq AI to analyze recipe for real prep time, cook time, and servings
        const analysis = await analyzeRecipeWithGroq(
          recipe.strMeal,
          ingredients,
          recipe.strInstructions
        );

        // Format response
        const formattedRecipe = {
          id: recipe.idMeal,
          name: recipe.strMeal,
          category: recipe.strCategory,
          area: recipe.strArea,
          image: recipe.strMealThumb,
          instructions: recipe.strInstructions,
          ingredients: ingredients,
          video: recipe.strYoutube || '',
          tags: recipe.strTags ? recipe.strTags.split(',').map(t => t.trim()) : [],
          source: 'TheMealDB',
          sourceUrl: recipe.strSource || '',
          // Use Groq analysis if available, otherwise estimate
          prepTime: analysis?.prepTime || Math.min(15 + ingredients.length * 2, 30),
          cookTime: analysis?.cookTime || 30,
          servings: analysis?.servings || 4,
        };

        console.log(`✅ Found recipe: ${formattedRecipe.name}`);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ recipe: formattedRecipe }),
        };
      }
    } catch (error) {
      console.log(`TheMealDB lookup failed: ${error.message}`);
    }

    // If not found in TheMealDB, return not found
    console.log(`❌ Recipe with ID ${id} not found`);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Recipe not found' }),
    };

  } catch (error) {
    console.error('Error fetching recipe by ID:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch recipe', details: error.message }),
    };
  }
};
