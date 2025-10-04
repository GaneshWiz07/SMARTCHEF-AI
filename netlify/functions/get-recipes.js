import axios from 'axios';

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

// Helper function to fetch recipes from Edamam
async function fetchEdamamRecipes(query, cuisineType, dietLabel, limit = 20, randomOffset = 0) {
  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    console.log('Edamam credentials not configured, skipping Edamam fetch');
    return [];
  }

  try {
    // Use random offset for pagination to get different results
    const offset = randomOffset > 0 ? randomOffset : Math.floor(Math.random() * 50);
    
    const params = {
      type: 'public',
      app_id: EDAMAM_APP_ID,
      app_key: EDAMAM_APP_KEY,
      q: query || 'recipe',
      random: true,
      from: offset,
      to: offset + limit,
    };

    if (cuisineType) {
      params.cuisineType = cuisineType;
    }

    if (dietLabel) {
      // Edamam diet labels: balanced, high-fiber, high-protein, low-carb, low-fat, low-sodium
      // Edamam health labels: vegan, vegetarian, paleo, dairy-free, gluten-free, wheat-free, etc.
      const edamamDiet = {
        'vegetarian': { health: 'vegetarian' },
        'vegan': { health: 'vegan' },
        'keto': { diet: 'low-carb', health: 'keto-friendly' },
        'paleo': { health: 'paleo' },
        'seafood': { health: 'pescatarian' },
      }[dietLabel];

      if (edamamDiet?.diet) params.diet = edamamDiet.diet;
      if (edamamDiet?.health) params.health = edamamDiet.health;
    }

    console.log(`Fetching from Edamam: ${cuisineType || 'any'} cuisine, ${dietLabel || 'any'} diet`);
    
    const response = await axios.get('https://api.edamam.com/api/recipes/v2', { params });

    if (response.data.hits && response.data.hits.length > 0) {
      const recipes = response.data.hits.map(hit => {
        // Normalize cuisine type to match our expected format
        let area = hit.recipe.cuisineType?.[0] || cuisineType || 'International';
        
        // Capitalize first letter to match TheMealDB format
        area = area.charAt(0).toUpperCase() + area.slice(1).toLowerCase();
        
        return {
          idMeal: hit.recipe.uri.split('#')[1] || hit.recipe.label.replace(/\s/g, '_'),
          strMeal: hit.recipe.label,
          strCategory: hit.recipe.dishType?.[0] || 'Main course',
          strArea: area,
          strMealThumb: hit.recipe.image,
          strInstructions: hit.recipe.url ? `View full recipe at: ${hit.recipe.url}\n\n` + (hit.recipe.ingredientLines?.join('\n') || '') : hit.recipe.ingredientLines?.join('\n') || 'No instructions available',
          strYoutube: '',
          strTags: hit.recipe.dietLabels?.join(',') || '',
          strSource: 'Edamam',
          strImageSource: hit.recipe.source,
          strIngredient1: hit.recipe.ingredientLines?.[0] || '',
          strIngredient2: hit.recipe.ingredientLines?.[1] || '',
          strIngredient3: hit.recipe.ingredientLines?.[2] || '',
          strIngredient4: hit.recipe.ingredientLines?.[3] || '',
          strIngredient5: hit.recipe.ingredientLines?.[4] || '',
          strMeasure1: '',
          strMeasure2: '',
          strMeasure3: '',
          strMeasure4: '',
          strMeasure5: '',
          // Store original ingredient lines for better matching
          _ingredientLines: hit.recipe.ingredientLines || [],
        };
      });

      console.log(`Fetched ${recipes.length} recipes from Edamam`);
      return recipes;
    }

    return [];
  } catch (error) {
    console.error('Edamam API error:', error.message);
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
    console.log(`Request: ${limit} recipes, excluding ${excludedIds.length} already shown`);

    // Fetch from TheMealDB (free API)
    let recipes = [];
    
    // When filters are combined or we have exclusions, fetch MORE recipes to ensure enough results
    const hasMultipleFilters = (dietary && dietary !== 'none') && region;
    const hasExclusions = excludedIds.length > 0;
    
    // Aggressive fetching for Load More with exclusions
    let fetchLimit = limit;
    if (hasMultipleFilters && hasExclusions) {
      fetchLimit = limit * 5; // 5x for both filters + exclusions
    } else if (hasMultipleFilters) {
      fetchLimit = limit * 3; // 3x for multiple filters
    } else if (hasExclusions) {
      fetchLimit = limit * 3; // 3x when loading more (has exclusions)
    }
    
    console.log(`Fetch strategy: fetchLimit=${fetchLimit}, hasMultipleFilters=${hasMultipleFilters}, excludedIds=${excludedIds.length}`);
    
    // Priority 1: Fetch by region/area if specified
    if (region && (!ingredients || ingredients.length === 0)) {
      try {
        // Special handling for Indian cuisine - fetch from multiple sources
        if (region.toLowerCase() === 'indian') {
          console.log('Fetching Indian recipes from multiple sources...');
          
          // Source 1: Indian Area
          const areaResponse = await axios.get(
            'https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian'
          );
          
          if (areaResponse.data.meals) {
            const allIndianMeals = [...areaResponse.data.meals];
            
            // Shuffle and get details for many recipes
            const shuffled = allIndianMeals.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(fetchLimit * 2, allIndianMeals.length));
            
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
            console.log(`Fetched ${recipes.length} Indian recipes`);
          }
        } else {
          // Standard region handling for other cuisines
          const response = await axios.get(
            `https://www.themealdb.com/api/json/v1/1/filter.php?a=${region}`
          );
          
          if (response.data.meals) {
            const shuffled = response.data.meals.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(fetchLimit, response.data.meals.length));
            
            const detailedRecipes = await Promise.all(
              selected.map(async (meal) => {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals[0];
              })
            );
            recipes.push(...detailedRecipes);
          }
        }
      } catch (error) {
        console.log('Region search failed, falling back:', error.message);
      }
    }
    
    // Priority 2: If dietary preference is set, try to fetch by category
    if (recipes.length === 0 && dietary && dietary !== 'none' && (!ingredients || ingredients.length === 0)) {
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
            // Get detailed info for random recipes from category
            const shuffled = response.data.meals.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, Math.min(fetchLimit, response.data.meals.length));
            
            const detailedRecipes = await Promise.all(
              selected.map(async (meal) => {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals[0];
              })
            );
            recipes.push(...detailedRecipes);
          }
        } catch (error) {
          console.log('Category search failed, falling back to random');
        }
      }
    }
    
    // If no recipes yet, search by ingredient or get random
    if (recipes.length === 0) {
      if (ingredients && ingredients.length > 0) {
        console.log(`Searching for recipes with ingredients: ${ingredients.join(', ')}`);
        
        // Search TheMealDB for EACH ingredient and combine results
        const ingredientSearchPromises = ingredients.map(async (ingredient) => {
          try {
            const response = await axios.get(
              `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
            );
            
            if (response.data.meals) {
              console.log(`Found ${response.data.meals.length} recipes with "${ingredient}"`);
              return response.data.meals.slice(0, 10); // Limit per ingredient
            }
            return [];
          } catch (error) {
            console.log(`Search failed for ingredient "${ingredient}":`, error.message);
            return [];
          }
        });
        
        const ingredientResults = await Promise.all(ingredientSearchPromises);
        const allMeals = ingredientResults.flat();
        
        // Remove duplicates by ID
        const uniqueMeals = Array.from(
          new Map(allMeals.map(meal => [meal.idMeal, meal])).values()
        );
        
        console.log(`Total unique recipes found from ingredients: ${uniqueMeals.length}`);
        
        if (uniqueMeals.length > 0) {
          // Get detailed info for each recipe
          const detailedRecipes = await Promise.all(
            uniqueMeals.slice(0, Math.min(fetchLimit, uniqueMeals.length)).map(async (meal) => {
              try {
                const detailResponse = await axios.get(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                return detailResponse.data.meals[0];
              } catch (error) {
                return null;
              }
            })
          );
          recipes.push(...detailedRecipes.filter(r => r !== null));
        }
        
        // Also search Edamam with ingredients for more results
        if (EDAMAM_APP_ID && EDAMAM_APP_KEY) {
          const ingredientQuery = ingredients.join(' ');
          
          // Map region to Edamam cuisine type
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
          
          const edamamRecipes = await fetchEdamamRecipes(
            ingredientQuery,
            region ? cuisineMap[region.toLowerCase()] : null,
            dietary !== 'none' ? dietary : null,
            20
          );
          
          if (edamamRecipes.length > 0) {
            console.log(`Found ${edamamRecipes.length} additional recipes from Edamam with ingredients`);
            recipes.push(...edamamRecipes);
          }
        }
        
        // Score recipes based on how many input ingredients they contain
        if (recipes.length > 0 && ingredients.length > 0) {
          console.log(`\n=== INGREDIENT MATCHING ===`);
          const scoredRecipes = recipes.map(recipe => {
            // Get all ingredients from the recipe
            let recipeIngredients = [];
            
            if (recipe._ingredientLines) {
              // Edamam format
              recipeIngredients = recipe._ingredientLines.join(' ').toLowerCase();
            } else {
              // TheMealDB format
              recipeIngredients = Object.keys(recipe)
                .filter(key => key.startsWith('strIngredient') && recipe[key])
                .map(key => recipe[key].toLowerCase())
                .join(' ');
            }
            
            // Count how many user ingredients are in this recipe
            let matchCount = 0;
            const matchedIngredients = [];
            
            ingredients.forEach(userIngredient => {
              const ing = userIngredient.toLowerCase();
              if (recipeIngredients.includes(ing)) {
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
          
          const topMatch = scoredRecipes[0];
          console.log(`Top match: ${topMatch.recipe.strMeal} with ${topMatch.matchCount}/${ingredients.length} ingredients`);
          console.log(`===========================\n`);
        }
        
        console.log(`Total recipes after ingredient search: ${recipes.length}`);
      } else {
        // Get LIMITED random recipes (max 12 to avoid rate limits)
        const randomCount = Math.min(fetchLimit, 12);
        console.log(`Fetching ${randomCount} random recipes`);
        
        try {
          const randomRecipes = await Promise.all(
            Array(randomCount).fill().map(() => 
              axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
            )
          );
          recipes.push(...randomRecipes.map(r => r.data.meals[0]));
        } catch (error) {
          console.log('TheMealDB random fetch failed:', error.message);
          // Continue with whatever recipes we have
        }
      }
    }
    
    // Supplement with Edamam recipes, especially for Indian cuisine or when we need more
    const shouldUseEdamam = (region && region.toLowerCase() === 'indian') || 
                            recipes.length < fetchLimit || 
                            hasExclusions; // Always use Edamam when loading more
    
    if (shouldUseEdamam) {
      console.log(`Supplementing with Edamam recipes...`);
      
      // Map region names to Edamam cuisine types
      const cuisineTypeMap = {
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
        'spanish': 'French', // Edamam doesn't have Spanish, use French as Mediterranean
        'moroccan': 'Middle Eastern',
        'turkish': 'Middle Eastern',
      };
      
      const edamamCuisine = region ? cuisineTypeMap[region.toLowerCase()] : null;
      
      // Fetch MORE from Edamam when loading more (Edamam is now primary source for Load More)
      const edamamFetchCount = hasExclusions ? 40 : 25; // Increased to compensate for reduced TheMealDB
      
      // Use excludedIds count to determine pagination offset for variety
      const edamamOffset = Math.floor(excludedIds.length / 10) * 20;
      
      const edamamRecipes = await fetchEdamamRecipes(
        dietary === 'seafood' ? 'seafood' : (region ? region : 'recipe'),
        edamamCuisine,
        dietary !== 'none' ? dietary : null,
        edamamFetchCount,
        edamamOffset // Pass offset for pagination
      );
      
      if (edamamRecipes.length > 0) {
        recipes.push(...edamamRecipes);
        console.log(`Added ${edamamRecipes.length} recipes from Edamam, total now: ${recipes.length}`);
      }
    }
    
    // If we STILL have very few recipes and filters are active, try to get more
    if (recipes.length < limit && (region || (dietary && dietary !== 'none'))) {
      console.log(`Only ${recipes.length} recipes found with filters, fetching more from TheMealDB...`);
      
      // For Indian region, try to get ALL Indian recipes from TheMealDB
      if (region && region.toLowerCase() === 'indian') {
        try {
          const allIndianResponse = await axios.get(
            'https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian'
          );
          
          if (allIndianResponse.data.meals) {
            // Get recipes we don't already have
            const existingIds = new Set(recipes.map(r => r.idMeal));
            const newMeals = allIndianResponse.data.meals.filter(m => !existingIds.has(m.idMeal));
            
            if (newMeals.length > 0) {
              const shuffled = newMeals.sort(() => 0.5 - Math.random());
              const needed = Math.min(limit * 2, shuffled.length);
              
              const moreRecipes = await Promise.all(
                shuffled.slice(0, needed).map(async (meal) => {
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
              
              recipes.push(...moreRecipes.filter(r => r !== null));
              console.log(`Added more Indian recipes, total now: ${recipes.length}`);
            }
          }
        } catch (error) {
          console.log('Failed to fetch additional Indian recipes:', error.message);
        }
      } else {
        // For other regions, get LIMITED random recipes (avoid rate limits)
        const additionalCount = Math.min(limit - recipes.length, 10); // Max 10 to avoid rate limits
        
        if (additionalCount > 0) {
          console.log(`Fetching ${additionalCount} random recipes as fallback`);
          try {
            const moreRecipes = await Promise.all(
              Array(additionalCount).fill().map(() => 
                axios.get('https://www.themealdb.com/api/json/v1/1/random.php')
              )
            );
            recipes.push(...moreRecipes.map(r => r.data.meals[0]));
          } catch (error) {
            console.log('TheMealDB random fetch failed (likely rate limit), continuing with existing recipes');
          }
        }
      }
    }

    // Filter by region if specified (STRICT matching)
    if (region && recipes.length > 0) {
      const beforeRegionFilter = recipes.length;
      recipes = recipes.filter(recipe => {
        const recipeArea = recipe.strArea?.toLowerCase() || '';
        const targetRegion = region.toLowerCase();
        
        // Log mismatches for debugging
        if (recipeArea && recipeArea !== targetRegion) {
          console.log(`Filtering out: ${recipe.strMeal} (${recipeArea} !== ${targetRegion})`);
        }
        
        return recipeArea === targetRegion;
      });
      console.log(`Region filter (${region}): ${beforeRegionFilter} → ${recipes.length} recipes`);
      
      // If too few recipes after strict filtering, log warning
      if (recipes.length < limit / 2) {
        console.log(`⚠️ Warning: Only ${recipes.length} recipes match ${region} exactly`);
      }
    }

    // Filter by dietary preferences with RELAXED matching to get more results
    let filteredRecipes = recipes;
    const initialRecipeCount = recipes.length;
    
    if (dietary && dietary !== 'none') {
      filteredRecipes = recipes.filter(recipe => {
        const category = recipe.strCategory?.toLowerCase() || '';
        const name = recipe.strMeal?.toLowerCase() || '';
        const area = recipe.strArea?.toLowerCase() || '';
        
        // Handle both TheMealDB and Edamam ingredient formats
        let ingredients = '';
        if (recipe._ingredientLines) {
          // Edamam format
          ingredients = recipe._ingredientLines.join(' ').toLowerCase();
        } else {
          // TheMealDB format
          ingredients = Object.keys(recipe)
            .filter(key => key.startsWith('strIngredient') && recipe[key])
            .map(key => recipe[key].toLowerCase())
            .join(' ');
        }

        switch(dietary) {
          case 'vegetarian':
            return category.includes('vegetarian') || 
                   (!ingredients.includes('chicken') && !ingredients.includes('beef') && 
                    !ingredients.includes('pork') && !ingredients.includes('lamb') &&
                    !ingredients.includes('meat') && !name.includes('chicken') &&
                    !name.includes('beef'));
          
          case 'vegan':
            return category.includes('vegan') || 
                   ((!ingredients.includes('chicken') && !ingredients.includes('beef') && 
                     !ingredients.includes('pork') && !ingredients.includes('fish')) &&
                    (!ingredients.includes('cheese') && !ingredients.includes('milk') && 
                     !ingredients.includes('egg') && !ingredients.includes('butter')));
          
          case 'keto':
            const hasProtein = ingredients.includes('chicken') || ingredients.includes('beef') || 
                              ingredients.includes('fish') || ingredients.includes('egg') ||
                              category.includes('beef') || category.includes('chicken') || 
                              category.includes('seafood');
            const hasCarbs = ingredients.includes('pasta') || ingredients.includes('rice') || 
                            ingredients.includes('bread') || ingredients.includes('potato') ||
                            name.includes('pasta') || name.includes('rice');
            return hasProtein && !hasCarbs;
          
          case 'paleo':
            const hasProteinPaleo = ingredients.includes('chicken') || ingredients.includes('beef') || 
                                   ingredients.includes('fish') || category.includes('chicken') ||
                                   category.includes('beef') || category.includes('seafood');
            const hasGrains = ingredients.includes('pasta') || ingredients.includes('rice') ||
                             ingredients.includes('bread');
            return hasProteinPaleo && !hasGrains;
          
          case 'seafood':
            // STRICT seafood check - must have actual seafood ingredients or category
            const hasSeafoodCategory = category.includes('seafood') || category.includes('fish');
            
            // Check for fish types
            const hasFish = ingredients.includes('fish') || ingredients.includes('salmon') ||
                   ingredients.includes('tuna') || ingredients.includes('cod') ||
                   ingredients.includes('haddock') || ingredients.includes('mackerel') ||
                   ingredients.includes('trout') || ingredients.includes('halibut') ||
                   ingredients.includes('tilapia') || ingredients.includes('sardine') ||
                   ingredients.includes('anchov') || ingredients.includes('herring') ||
                   ingredients.includes('bass') || ingredients.includes('snapper');
            
            // Check for shellfish
            const hasShellfish = ingredients.includes('shrimp') || ingredients.includes('prawn') ||
                   ingredients.includes('crab') || ingredients.includes('lobster') ||
                   ingredients.includes('clam') || ingredients.includes('mussel') ||
                   ingredients.includes('oyster') || ingredients.includes('scallop') ||
                   ingredients.includes('squid') || ingredients.includes('octopus') ||
                   ingredients.includes('crawfish') || ingredients.includes('crayfish');
            
            // Check name for seafood references
            const hasSeafoodName = name.includes('fish') || name.includes('seafood') ||
                   name.includes('salmon') || name.includes('tuna') ||
                   name.includes('prawn') || name.includes('shrimp') ||
                   name.includes('crab') || name.includes('lobster');
            
            // Must have at least one seafood indicator
            const isActualSeafood = hasSeafoodCategory || hasFish || hasShellfish || hasSeafoodName;
            
            // IMPORTANT: Exclude vegetarian/vegan dishes even if they mention "fish sauce" etc
            const isVegetarian = category.includes('vegetarian') || category.includes('vegan');
            
            return isActualSeafood && !isVegetarian;
          
          default:
            return true;
        }
      });
    }
    
    console.log(`Dietary filter (${dietary}): ${initialRecipeCount} → ${filteredRecipes.length} recipes`);
    
    // If filter resulted in too few recipes with BOTH filters, try ONLY dietary filter (ignore region)
    if (filteredRecipes.length < limit / 2 && hasMultipleFilters) {
      console.log(`Too few results with both filters (${filteredRecipes.length}/${limit}), trying dietary filter only...`);
      
      // Get all available recipes (re-fetch from the original pool before region filter)
      let allRecipes = recipes;
      
      // Apply ONLY dietary filter to all recipes (ignore region restriction)
      const dietaryOnlyFiltered = allRecipes.filter(recipe => {
        const category = recipe.strCategory?.toLowerCase() || '';
        const name = recipe.strMeal?.toLowerCase() || '';
        const area = recipe.strArea?.toLowerCase() || '';
        
        // Handle both TheMealDB and Edamam ingredient formats
        let ingredients = '';
        if (recipe._ingredientLines) {
          ingredients = recipe._ingredientLines.join(' ').toLowerCase();
        } else {
          ingredients = Object.keys(recipe)
            .filter(key => key.startsWith('strIngredient') && recipe[key])
            .map(key => recipe[key].toLowerCase())
            .join(' ');
        }

        switch(dietary) {
          case 'vegetarian':
            return category.includes('vegetarian') || 
                   (!ingredients.includes('chicken') && !ingredients.includes('beef') && 
                    !ingredients.includes('pork') && !ingredients.includes('lamb') &&
                    !ingredients.includes('meat') && !name.includes('chicken') &&
                    !name.includes('beef'));
          
          case 'vegan':
            return category.includes('vegan') || 
                   ((!ingredients.includes('chicken') && !ingredients.includes('beef') && 
                     !ingredients.includes('pork') && !ingredients.includes('fish')) &&
                    (!ingredients.includes('cheese') && !ingredients.includes('milk') && 
                     !ingredients.includes('egg') && !ingredients.includes('butter')));
          
          case 'keto':
            const hasProtein = ingredients.includes('chicken') || ingredients.includes('beef') || 
                              ingredients.includes('fish') || ingredients.includes('egg') ||
                              category.includes('beef') || category.includes('chicken') || 
                              category.includes('seafood');
            const hasCarbs = ingredients.includes('pasta') || ingredients.includes('rice') || 
                            ingredients.includes('bread') || ingredients.includes('potato') ||
                            name.includes('pasta') || name.includes('rice');
            return hasProtein && !hasCarbs;
          
          case 'paleo':
            const hasProteinPaleo = ingredients.includes('chicken') || ingredients.includes('beef') || 
                                   ingredients.includes('fish') || category.includes('chicken') ||
                                   category.includes('beef') || category.includes('seafood');
            const hasGrains = ingredients.includes('pasta') || ingredients.includes('rice') ||
                             ingredients.includes('bread');
            return hasProteinPaleo && !hasGrains;
          
          case 'seafood':
            // STRICT seafood check - must have actual seafood
            const isSeafood = category.includes('seafood') || category.includes('fish') ||
                   ingredients.includes('fish') || ingredients.includes('salmon') ||
                   ingredients.includes('tuna') || ingredients.includes('cod') ||
                   ingredients.includes('haddock') || ingredients.includes('mackerel') ||
                   ingredients.includes('trout') || ingredients.includes('halibut') ||
                   ingredients.includes('tilapia') || ingredients.includes('sardine') ||
                   ingredients.includes('anchov') || ingredients.includes('herring') ||
                   ingredients.includes('shrimp') || ingredients.includes('prawn') ||
                   ingredients.includes('crab') || ingredients.includes('lobster') ||
                   ingredients.includes('clam') || ingredients.includes('mussel') ||
                   ingredients.includes('oyster') || ingredients.includes('scallop') ||
                   ingredients.includes('squid') || ingredients.includes('octopus') ||
                   name.includes('fish') || name.includes('seafood') ||
                   name.includes('salmon') || name.includes('tuna') ||
                   name.includes('prawn') || name.includes('shrimp') ||
                   name.includes('crab') || name.includes('lobster');
            return isSeafood;
          
          default:
            return true;
        }
      });
      
      if (dietaryOnlyFiltered.length >= filteredRecipes.length) {
        console.log(`Found ${dietaryOnlyFiltered.length} recipes matching ${dietary} filter (ignoring region)`);
        filteredRecipes = dietaryOnlyFiltered;
      } else {
        console.log(`Keeping ${filteredRecipes.length} recipes with both filters`);
      }
    }
    
    // Remove duplicates based on recipe ID
    const uniqueRecipes = Array.from(
      new Map(filteredRecipes.map(recipe => [recipe.idMeal, recipe])).values()
    );
    
    // Filter out recipes that were already shown (excludedIds)
    const notExcludedRecipes = uniqueRecipes.filter(recipe => 
      !excludedIds.includes(recipe.idMeal)
    );
    
    console.log(`After removing excluded IDs: ${notExcludedRecipes.length} recipes (excluded ${uniqueRecipes.length - notExcludedRecipes.length})`);
    
    // Take only specified number of best matches
    filteredRecipes = notExcludedRecipes.slice(0, limit);
    
    console.log(`\n=== FILTER SUMMARY ===`);
    console.log(`Region: ${region || 'none'}`);
    console.log(`Dietary: ${dietary || 'none'}`);
    console.log(`Excluded IDs: ${excludedIds.length}`);
    console.log(`Final recipes: ${filteredRecipes.length}/${limit} requested`);
    console.log(`======================\n`);

    // Format recipes and add ingredient match info
    const formattedRecipes = filteredRecipes.map(recipe => {
      let recipeIngredients = [];
      
      if (recipe._ingredientLines) {
        // Edamam format - ingredient lines
        recipeIngredients = recipe._ingredientLines.map(line => ({
          name: line,
          measure: ''
        }));
      } else {
        // TheMealDB format - separate ingredient and measure fields
        recipeIngredients = Object.keys(recipe)
          .filter(key => key.startsWith('strIngredient') && recipe[key])
          .map((key, index) => ({
            name: recipe[key],
            measure: recipe[`strMeasure${index + 1}`] || ''
          }));
      }
      
      // Calculate ingredient match if user searched with ingredients
      let ingredientMatchCount = 0;
      let matchedUserIngredients = [];
      
      if (ingredients && ingredients.length > 0) {
        const recipeIngredientsText = recipeIngredients
          .map(ing => ing.name.toLowerCase())
          .join(' ');
        
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
        source: recipe.strSource || 'TheMealDB',
        ingredientMatchCount, // How many user ingredients this recipe contains
        matchedUserIngredients, // Which user ingredients matched
        totalUserIngredients: ingredients?.length || 0, // Total ingredients user searched for
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ recipes: formattedRecipes }),
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

