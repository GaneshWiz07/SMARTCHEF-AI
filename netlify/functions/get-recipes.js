import axios from 'axios';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
const EDAMAM_RECIPE_APP_ID = process.env.EDAMAM_RECIPE_APP_ID;
const EDAMAM_RECIPE_APP_KEY = process.env.EDAMAM_RECIPE_APP_KEY;

// Helper function to strip HTML tags and clean text
function stripHtml(html) {
  if (!html) return '';
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Helper function to fetch recipes from TheMealDB as fallback
async function fetchFromTheMealDB(region, dietary, ingredients, limit = 12) {
  try {
    let recipes = [];
    
    // Priority 1: Search by ingredient if provided
    if (ingredients && ingredients.length > 0) {
      console.log(`Searching TheMealDB by ingredients: ${ingredients.join(', ')}...`);
      
      // Search by first ingredient (TheMealDB API limitation)
      const mainIngredient = ingredients[0];
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(mainIngredient)}`
        );
        
        if (response.data.meals) {
          console.log(`Found ${response.data.meals.length} recipes with "${mainIngredient}"`);
          
          // Get detailed recipe information
          const detailedRecipes = await Promise.all(
            response.data.meals.slice(0, Math.min(limit * 2, response.data.meals.length)).map(async (meal) => {
              try {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals[0];
              } catch (err) {
                return null;
              }
            })
          );
          
          let filteredRecipes = detailedRecipes.filter(r => r !== null);
          
          // Filter by additional ingredients if more than one provided
          if (ingredients.length > 1) {
            filteredRecipes = filteredRecipes.filter(recipe => {
              const recipeIngredients = Object.keys(recipe)
                .filter(key => key.startsWith('strIngredient') && recipe[key])
                .map(key => recipe[key].toLowerCase())
                .join(' ');
              
              // Check if recipe contains at least one more ingredient from the search
              return ingredients.slice(1).some(ing => 
                recipeIngredients.includes(ing.toLowerCase())
              );
            });
          }
          
          recipes.push(...filteredRecipes);
          console.log(`After filtering: ${recipes.length} recipes match ingredients`);
        }
      } catch (error) {
        console.log('TheMealDB ingredient search failed:', error.message);
      }
    }
    
    // If no specific filters and no ingredients, get random recipes from various categories
    if (recipes.length === 0 && (!region || region === 'all') && (!dietary || dietary === 'none') && (!ingredients || ingredients.length === 0)) {
      console.log('Fetching random recipes from TheMealDB...');
      try {
        const randomCount = Math.min(limit, 12);
        const randomRecipes = await Promise.all(
          Array(randomCount).fill().map(() => 
            axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
          )
        );
        recipes.push(...randomRecipes.map(r => r.data.meals[0]).filter(r => r !== null));
        console.log(`Fetched ${recipes.length} random recipes from TheMealDB`);
      } catch (error) {
        console.log('TheMealDB random fetch failed:', error.message);
      }
    }
    
    // Priority 2: Fetch by region if specified and we don't have enough recipes
    if (recipes.length < limit && region && region !== 'all' && (!ingredients || ingredients.length === 0)) {
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?a=${region}`
        );
        
        if (response.data.meals) {
          const shuffled = response.data.meals.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, Math.min(limit * 2, response.data.meals.length));
            
            const detailedRecipes = await Promise.all(
              selected.map(async (meal) => {
                try {
                  const detailResponse = await axios.get(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                  );
                  return detailResponse.data.meals[0];
                } catch (err) {
                  return null;
                }
              })
            );
            
            recipes.push(...detailedRecipes.filter(r => r !== null));
        }
      } catch (error) {
        console.log('TheMealDB region search failed:', error.message);
      }
    }
    
    // Priority 3: Try by category if dietary is set and we don't have enough recipes
    if (recipes.length < limit && dietary && dietary !== 'none' && (!ingredients || ingredients.length === 0)) {
      const categoryMap = {
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan', 
        'seafood': 'Seafood',
      };
      
      const category = categoryMap[dietary];
      if (category) {
        try {
          const response = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
          );
          
          if (response.data.meals) {
            const shuffled = response.data.meals.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(limit, response.data.meals.length));
            
            const detailedRecipes = await Promise.all(
              selected.map(async (meal) => {
                try {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals[0];
                } catch (err) {
                  return null;
                }
              })
            );
            
            recipes.push(...detailedRecipes.filter(r => r !== null));
          }
        } catch (error) {
          console.log('TheMealDB category search failed:', error.message);
        }
      }
    }
    
    // Filter by dietary preferences if we have recipes
    if (dietary && dietary !== 'none' && recipes.length > 0) {
      recipes = recipes.filter(recipe => {
        const ingredients = Object.keys(recipe)
          .filter(key => key.startsWith('strIngredient') && recipe[key])
          .map(key => recipe[key].toLowerCase())
          .join(' ');
        const name = recipe.strMeal?.toLowerCase() || '';
        const category = recipe.strCategory?.toLowerCase() || '';

        switch(dietary) {
          case 'vegetarian':
            return !ingredients.includes('chicken') && !ingredients.includes('beef') && 
                   !ingredients.includes('pork') && !ingredients.includes('lamb');
          case 'vegan':
            return !ingredients.includes('chicken') && !ingredients.includes('beef') && 
                   !ingredients.includes('cheese') && !ingredients.includes('milk') && 
                   !ingredients.includes('egg');
          case 'paleo':
            const hasProtein = ingredients.includes('chicken') || ingredients.includes('beef') || 
                              ingredients.includes('fish');
            const hasGrains = ingredients.includes('pasta') || ingredients.includes('rice') || 
                             ingredients.includes('bread');
            return hasProtein && !hasGrains;
          case 'keto':
            const hasProteinKeto = ingredients.includes('chicken') || ingredients.includes('beef') || 
                                  ingredients.includes('fish');
            const hasCarbs = ingredients.includes('pasta') || ingredients.includes('rice') || 
                            ingredients.includes('potato');
            return hasProteinKeto && !hasCarbs;
          case 'seafood':
            return category.includes('seafood') || ingredients.includes('fish') || 
                   ingredients.includes('salmon') || ingredients.includes('shrimp');
          default:
            return true;
        }
      });
    }
    
    // Convert TheMealDB format to our standard format
    return recipes.slice(0, limit).map(recipe => ({
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strCategory: recipe.strCategory,
      strArea: recipe.strArea,
      strMealThumb: recipe.strMealThumb,
      strInstructions: recipe.strInstructions,
      strYoutube: recipe.strYoutube || '',
      strTags: recipe.strTags || '',
      strSource: 'TheMealDB',
      strSourceUrl: recipe.strSource || '',
      _ingredientLines: Object.keys(recipe)
        .filter(key => key.startsWith('strIngredient') && recipe[key])
        .map((key, index) => {
          const measure = recipe[`strMeasure${index + 1}`] || '';
          const ingredient = recipe[key];
          return `${measure} ${ingredient}`.trim();
        }),
    }));
          } catch (error) {
    console.error('TheMealDB fallback error:', error.message);
            return [];
          }
}

// Helper function to fetch recipes from Edamam Recipe API
async function fetchEdamamRecipes(query, cuisine, diet, limit = 20) {
  // Use separate Recipe API credentials if available, otherwise try main credentials
  const appId = EDAMAM_RECIPE_APP_ID || EDAMAM_APP_ID;
  const appKey = EDAMAM_RECIPE_APP_KEY || EDAMAM_APP_KEY;
  
  if (!appId || !appKey) {
    console.log('Edamam Recipe API credentials not configured, skipping');
    return [];
  }

  try {
    const params = {
      type: 'public',
      app_id: appId,
      app_key: appKey,
      q: query || 'recipe',
      to: limit,
    };

    // Map cuisine to Edamam cuisine types
    if (cuisine) {
      const cuisineMap = {
        'indian': 'Indian',
        'chinese': 'Chinese',
        'japanese': 'Japanese',
        'italian': 'Italian',
        'french': 'French',
        'mexican': 'Mexican',
        'thai': 'Thai',
        'greek': 'Greek',
        'american': 'American',
        'british': 'British',
      };
      params.cuisineType = cuisineMap[cuisine.toLowerCase()] || cuisine;
    }

    // Map diet to Edamam health labels
    if (diet) {
      const dietMap = {
        'vegetarian': 'vegetarian',
        'vegan': 'vegan',
        'paleo': 'paleo',
        'keto': 'keto-friendly',
        'pescatarian': 'pescatarian',
      };
      params.health = dietMap[diet.toLowerCase()] || diet;
    }

    console.log(`Fetching from Edamam Recipe API: ${cuisine || 'any'} cuisine, ${diet || 'any'} diet`);
    
    const response = await axios.get('https://api.edamam.com/api/recipes/v2', { params });

    if (response.data.hits && response.data.hits.length > 0) {
      console.log(`Found ${response.data.hits.length} recipes from Edamam (total: ${response.data.count})`);

      // Convert Edamam format to our standard format
      const formattedRecipes = response.data.hits.map(hit => {
        const recipe = hit.recipe;
        
        // Extract area/cuisine
        let area = recipe.cuisineType?.[0] || cuisine || 'International';
        area = area.charAt(0).toUpperCase() + area.slice(1).toLowerCase();
        
        // Extract ingredients
        const ingredientLines = recipe.ingredientLines || [];
        
        // Create instruction text
        const ingredientsText = ingredientLines.join('\n');
        const instructions = recipe.url ? 
          `View full recipe at: ${recipe.url}\n\nIngredients:\n${ingredientsText}` : 
          ingredientsText;

        return {
          idMeal: `edamam_${recipe.uri.split('#recipe_')[1] || Math.random().toString(36).substr(2, 9)}`,
          strMeal: recipe.label,
          strCategory: recipe.dishType?.[0] || recipe.mealType?.[0] || 'Main course',
          strArea: area,
          strMealThumb: recipe.image,
          strInstructions: stripHtml(instructions),
          strYoutube: '',
          strTags: recipe.healthLabels?.join(',') || '',
          strSource: 'Edamam',
          strSourceUrl: recipe.url,
          strImageSource: recipe.source,
          _ingredientLines: ingredientLines,
          _edamamData: {
            calories: Math.round(recipe.calories),
            healthScore: Math.round((recipe.healthLabels?.length || 5) * 10), // Rough estimate
          }
        };
      });

      return formattedRecipes;
    }

    return [];
  } catch (error) {
    console.error('Edamam Recipe API error:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    return [];
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
    const { ingredients, dietary, region, limit = 12, excludedIds = [] } = JSON.parse(event.body || '{}');
    console.log(`\n=== NEW REQUEST ===`);
    console.log(`Limit: ${limit} recipes, Excluded: ${excludedIds.length} already shown`);
    console.log(`Filters: region=${region || 'none'}, dietary=${dietary || 'none'}, ingredients=${ingredients?.join(', ') || 'none'}`);

    let recipes = [];
    
    // Build search query from ingredients
    const searchQuery = ingredients && ingredients.length > 0 ? ingredients.join(' ') : null;
    
    // PRIMARY: Fetch from TheMealDB (free, unlimited)
    console.log(`Fetching from TheMealDB (primary source)...`);
    const mealDBRecipes = await fetchFromTheMealDB(region, dietary, ingredients, limit * 2);
    
    if (mealDBRecipes.length > 0) {
      recipes.push(...mealDBRecipes);
      console.log(`✅ Fetched ${mealDBRecipes.length} recipes from TheMealDB`);
    }
    
    // SUPPLEMENTARY: Try Edamam Recipe API if TheMealDB doesn't have enough results
    if (recipes.length < limit && EDAMAM_APP_ID && EDAMAM_APP_KEY) {
      console.log(`TheMealDB returned ${recipes.length}/${limit} recipes. Trying Edamam Recipe API for more...`);
      
      try {
        const edamamRecipes = await fetchEdamamRecipes(
          searchQuery || (region && region !== 'all' ? region : 'recipe'),
          region && region !== 'all' ? region : null,
          dietary && dietary !== 'none' ? dietary : null,
          limit - recipes.length // Only fetch what we need
        );
        
        if (edamamRecipes.length > 0) {
          recipes.push(...edamamRecipes);
          console.log(`✅ Added ${edamamRecipes.length} recipes from Edamam, total: ${recipes.length}`);
        }
      } catch (error) {
        console.log(`⚠️ Edamam Recipe API failed (skipping): ${error.message}`);
        // Continue with what we have
      }
    }
    
    // That's it! Only TheMealDB + Edamam

    // Score recipes based on ingredient matching if user searched with ingredients
    if (ingredients && ingredients.length > 0 && recipes.length > 0) {
          console.log(`\n=== INGREDIENT MATCHING ===`);
          const scoredRecipes = recipes.map(recipe => {
            // Get all ingredients from the recipe
        const recipeIngredientsText = recipe._ingredientLines?.join(' ').toLowerCase() || '';
            
            // Count how many user ingredients are in this recipe
            let matchCount = 0;
            const matchedIngredients = [];
            
            ingredients.forEach(userIngredient => {
              const ing = userIngredient.toLowerCase();
          if (recipeIngredientsText.includes(ing)) {
                matchCount++;
                matchedIngredients.push(userIngredient);
              }
            });
            
            console.log(`${recipe.strMeal}: ${matchCount}/${ingredients.length} ingredients (${matchedIngredients.join(', ') || 'none'})`);
            
            return {
              recipe,
              matchCount,
              matchedIngredients
            };
          });
          
          // Sort by match count (highest first)
          scoredRecipes.sort((a, b) => b.matchCount - a.matchCount);
          
          // Replace recipes with sorted ones
          recipes = scoredRecipes.map(item => item.recipe);
          
      if (scoredRecipes.length > 0) {
          const topMatch = scoredRecipes[0];
          console.log(`Top match: ${topMatch.recipe.strMeal} with ${topMatch.matchCount}/${ingredients.length} ingredients`);
      }
      console.log(`===========================\n`);
    }
    
    // Remove duplicates based on recipe ID
    const uniqueRecipes = Array.from(
      new Map(recipes.map(recipe => [recipe.idMeal, recipe])).values()
    );
    
    console.log(`After deduplication: ${uniqueRecipes.length} unique recipes`);
    
    // Filter out recipes that were already shown (excludedIds)
    const notExcludedRecipes = uniqueRecipes.filter(recipe => 
      !excludedIds.includes(recipe.idMeal)
    );
    
    console.log(`After removing excluded IDs: ${notExcludedRecipes.length} recipes (excluded ${uniqueRecipes.length - notExcludedRecipes.length})`);
    
    // Take only specified number
    const finalRecipes = notExcludedRecipes.slice(0, limit);
    
    console.log(`\n=== FINAL RESULTS ===`);
    console.log(`Returning ${finalRecipes.length}/${limit} requested recipes`);
    console.log(`======================\n`);

    // Format recipes with ingredient details
    const formattedRecipes = finalRecipes.map(recipe => {
      // Parse ingredient lines into structured format
      const recipeIngredients = recipe._ingredientLines?.map(line => ({
          name: line,
          measure: ''
      })) || [];
      
      // Calculate ingredient match if user searched with ingredients
      let ingredientMatchCount = 0;
      let matchedUserIngredients = [];
      
      if (ingredients && ingredients.length > 0) {
        const recipeIngredientsText = recipe._ingredientLines?.join(' ').toLowerCase() || '';
        
        ingredients.forEach(userIngredient => {
          const ing = userIngredient.toLowerCase();
          if (recipeIngredientsText.includes(ing)) {
            ingredientMatchCount++;
            matchedUserIngredients.push(userIngredient);
          }
        });
      }
      
      return {
        id: recipe.idMeal,
        name: recipe.strMeal,
        category: recipe.strCategory,
        area: recipe.strArea,
        image: recipe.strMealThumb,
        instructions: recipe.strInstructions,
        ingredients: recipeIngredients,
        video: recipe.strYoutube || '',
        tags: recipe.strTags ? recipe.strTags.split(',') : [],
        source: recipe.strSource || 'Spoonacular',
        sourceUrl: recipe.strSourceUrl,
        ingredientMatchCount,
        matchedUserIngredients,
        totalUserIngredients: ingredients?.length || 0,
        readyInMinutes: recipe._spoonacularData?.readyInMinutes,
        servings: recipe._spoonacularData?.servings,
        healthScore: recipe._spoonacularData?.healthScore,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        recipes: formattedRecipes,
        totalAvailable: formattedRecipes.length,
      }),
    };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch recipes', details: error.message }),
    };
  }
};
