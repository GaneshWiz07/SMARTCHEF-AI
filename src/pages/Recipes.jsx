import { useState } from 'react';
import IngredientInput from '../components/IngredientInput';
import RecipeCard from '../components/RecipeCard';
import DietaryFilter from '../components/DietaryFilter';
import RegionFilter from '../components/RegionFilter';
import axios from 'axios';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [dietary, setDietary] = useState('none');
  const [region, setRegion] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [noMoreRecipes, setNoMoreRecipes] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if user has performed any search

  // Handler for dietary filter change - clears recipes
  const handleDietaryChange = (newDietary) => {
    setDietary(newDietary);
    setRecipes([]); // Clear recipes when filter changes
    setNoMoreRecipes(false);
    setCanLoadMore(true);
    setHasSearched(false); // Reset search state when filter changes
  };

  // Handler for region filter change - clears recipes
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    setRecipes([]); // Clear recipes when filter changes
    setNoMoreRecipes(false);
    setCanLoadMore(true);
    setHasSearched(false); // Reset search state when filter changes
  };

  const searchRecipes = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setRecipes([]);
      setNoMoreRecipes(false);
      setHasSearched(true); // Mark that a search has been performed
    }
    
    try {
      // Get list of already displayed recipe IDs to exclude
      const excludedIds = append ? recipes.map(r => r.id) : [];
      
      const response = await axios.post('/.netlify/functions/get-recipes', {
        ingredients,
        dietary,
        region: region !== 'all' ? region : null,
        limit: 12, // Request 12 recipes at a time
        excludedIds, // Pass IDs to exclude
      });
      
      // Filter out any duplicates (extra safety check)
      const newRecipes = response.data.recipes.filter(
        newRecipe => !excludedIds.includes(newRecipe.id)
      );
      
      // Fallback is handled silently in the backend
      
      if (append) {
        if (newRecipes.length === 0) {
          // No new recipes found
          setCanLoadMore(false);
          setNoMoreRecipes(true);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
          setCanLoadMore(newRecipes.length >= 12);
          setNoMoreRecipes(false);
        }
      } else {
        setRecipes(newRecipes);
        setCanLoadMore(newRecipes.length >= 12);
        setNoMoreRecipes(false);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Failed to fetch recipes. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRandomRecipes = async (append = false) => {
    setIngredients([]);
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setRecipes([]);
      setNoMoreRecipes(false);
      setHasSearched(true); // Mark that a search has been performed
    }
    
    try {
      // Get list of already displayed recipe IDs to exclude
      const excludedIds = append ? recipes.map(r => r.id) : [];
      
      const response = await axios.post('/.netlify/functions/get-recipes', {
        ingredients: [],
        dietary,
        region: region !== 'all' ? region : null,
        limit: 12,
        excludedIds, // Pass IDs to exclude
      });
      
      // Filter out any duplicates (extra safety check)
      const newRecipes = response.data.recipes.filter(
        newRecipe => !excludedIds.includes(newRecipe.id)
      );
      
      // Fallback is handled silently in the backend
      
      if (append) {
        if (newRecipes.length === 0) {
          // No new recipes found
          setCanLoadMore(false);
          setNoMoreRecipes(true);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
          setCanLoadMore(newRecipes.length >= 12);
          setNoMoreRecipes(false);
        }
      } else {
        setRecipes(newRecipes);
        setCanLoadMore(newRecipes.length >= 12);
        setNoMoreRecipes(false);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreRecipes = () => {
    if (ingredients.length > 0) {
      searchRecipes(true);
    } else {
      handleRandomRecipes(true);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Find Your Perfect Recipe</h1>
        <p className="text-sm sm:text-base text-gray-600">Enter ingredients you have or get random suggestions</p>
      </div>

      {/* Search Section */}
      <div className="glass-card p-6">
        <div className="space-y-6">
          <IngredientInput
            ingredients={ingredients}
            onChange={setIngredients}
            onSearch={searchRecipes}
          />
          
          <div>
            <label className="block font-medium text-gray-700 mb-2">Dietary Preferences</label>
            <DietaryFilter value={dietary} onChange={handleDietaryChange} />
          </div>

          <RegionFilter value={region} onChange={handleRegionChange} />
          
          <div className="flex justify-center">
            <button
              onClick={handleRandomRecipes}
              className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ✨ Generate
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="relative inline-block">
            {/* Outer spinning ring */}
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            {/* Inner icon */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl">
              🍳
            </div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Finding delicious recipes...</p>
          <div className="mt-3 flex justify-center gap-1">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && recipes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">
              Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {ingredients.length > 0 && (
                <div className="px-4 py-2 bg-green-100/80 backdrop-blur-sm text-green-700 rounded-lg font-medium text-sm border border-green-200/50">
                  🥗 With: {ingredients.join(', ')}
                </div>
              )}
              {dietary !== 'none' && (
                <div className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
                  Diet: {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
                </div>
              )}
              {region !== 'all' && (
                <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm">
                  Region: {region}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {canLoadMore && recipes.length > 0 && !noMoreRecipes && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreRecipes}
                disabled={loadingMore}
                className="btn-primary px-6 sm:px-8 py-3 text-base sm:text-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Loading More...
                  </>
                ) : (
                  <>📚 Load More Recipes</>
                )}
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Showing {recipes.length} recipes
              </p>
            </div>
          )}
          
          {/* No More Recipes Message */}
          {noMoreRecipes && recipes.length > 0 && (
            <div className="text-center mt-8 glass-card p-6 bg-gradient-to-r from-primary-50/50 to-blue-50/50">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">That's all the recipes!</h3>
              <p className="text-gray-600">
                You've seen all {recipes.length} available recipes matching your criteria.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try different filters or ingredients to discover more recipes!
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Results - Only show after searching and getting 0 results */}
      {!loading && recipes.length === 0 && hasSearched && (
        <div className="text-center py-12 glass-card p-8">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-bold mb-2">No recipes found</h3>
          <p className="text-gray-600 mb-4">
            {dietary !== 'none' || region !== 'all'
              ? `No recipes available for the selected filters. Try adjusting your filters.`
              : ingredients.length > 0
              ? `No recipes found with ingredients: ${ingredients.join(', ')}. Try different ingredients.`
              : 'No recipes available. Please try again later.'
            }
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {dietary !== 'none' && (
              <button onClick={() => handleDietaryChange('none')} className="btn-primary">
                Clear Dietary Filter
              </button>
            )}
            {region !== 'all' && (
              <button onClick={() => handleRegionChange('all')} className="btn-primary">
                Clear Region Filter
              </button>
            )}
            {ingredients.length > 0 && (
              <button onClick={() => setIngredients([])} className="btn-primary">
                Clear Ingredients
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty State - Show before any search */}
      {!loading && recipes.length === 0 && !hasSearched && (
        <div className="text-center py-16 glass-card p-8">
          <div className="text-7xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">Ready to find recipes?</h3>
          <p className="text-gray-600 mb-6">
            Enter ingredients you have or click "✨ Generate" for random suggestions
          </p>
          <div className="flex gap-2 justify-center flex-wrap text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-100 rounded-full">🥗 50+ Cuisines</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">🍽️ Multiple Diets</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">📊 Nutrition Info</span>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

function InstructionSteps({ instructions }) {
  // Parse instructions into steps
  const parseInstructions = (text) => {
    if (!text) return [];
    
    // Split by common delimiters: newlines, numbered steps, or periods followed by capital letters
    let steps = [];
    
    // Try to split by explicit numbering (1., 2., Step 1, etc.)
    if (/^\d+[\.\)]\s|^Step\s+\d+/im.test(text)) {
      steps = text.split(/(?=\d+[\.\)]\s)|(?=Step\s+\d+)/i)
        .filter(step => step.trim().length > 0)
        .map(step => step.replace(/^\d+[\.\)]\s*|^Step\s+\d+[:\.\)]\s*/i, '').trim());
    }
    // Try splitting by newlines
    else if (text.includes('\n')) {
      steps = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 20); // Filter out very short lines
    }
    // Try splitting by periods followed by uppercase letters
    else if (/\.\s+[A-Z]/.test(text)) {
      steps = text.split(/\.\s+(?=[A-Z])/)
        .map(step => step.trim())
        .filter(step => step.length > 0)
        .map(step => step.endsWith('.') ? step : step + '.');
    }
    // If no clear pattern, treat as one long instruction
    else {
      steps = [text.trim()];
    }
    
    return steps.filter(step => step.length > 0);
  };
  
  const steps = parseInstructions(instructions);
  
  // If only one step and it's very long, it might be a paragraph - split by sentences
  if (steps.length === 1 && steps[0].length > 200) {
    const sentences = steps[0].split(/\.\s+/)
      .filter(s => s.trim().length > 20)
      .map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
    if (sentences.length > 1) {
      return (
        <ol className="space-y-4">
          {sentences.map((sentence, index) => (
            <li key={index} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <p className="text-gray-700 flex-1 pt-1">{sentence}</p>
            </li>
          ))}
        </ol>
      );
    }
  }
  
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-primary-600/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-bold shadow-md">
            {index + 1}
          </span>
          <p className="text-gray-700 flex-1 pt-1">{step}</p>
        </li>
      ))}
    </ol>
  );
}

function RecipeDetailModal({ recipe, onClose }) {
  const [nutrition, setNutrition] = useState(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);

  const fetchNutrition = async () => {
    setLoadingNutrition(true);
    try {
      const ingredientStrings = recipe.ingredients.map(
        ing => `${ing.measure} ${ing.name}`
      );
      const response = await axios.post('/.netlify/functions/nutrition', {
        ingredients: ingredientStrings,
        recipe: { 
          id: recipe.id, // Pass recipe ID to fetch nutrition from Spoonacular
          name: recipe.name,
          healthScore: recipe.healthScore // Pass Spoonacular health score
        },
      });
      setNutrition(response.data.nutrition);
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold pr-2">{recipe.name}</h2>
          <button onClick={onClose} className="text-3xl hover:text-gray-600 flex-shrink-0">×</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-xl"
          />

          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary-100/80 backdrop-blur-sm text-primary-700 rounded-full text-sm border border-primary-200/50">
              {recipe.category}
            </span>
            <span className="px-3 py-1 bg-blue-100/80 backdrop-blur-sm text-blue-700 rounded-full text-sm border border-blue-200/50">
              {recipe.area}
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3">Ingredients</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="text-primary-600 mr-2">•</span>
                  <span className="font-medium">{ing.measure}</span>
                  <span className="ml-2">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">📝 Instructions</h3>
            <InstructionSteps instructions={recipe.instructions} />
          </div>

          {recipe.video && (
            <div>
              <h3 className="text-xl font-bold mb-3">Video Tutorial</h3>
              <a
                href={recipe.video}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-block"
              >
                🎥 Watch on YouTube
              </a>
            </div>
          )}

          <div>
            <button
              onClick={fetchNutrition}
              disabled={loadingNutrition || nutrition}
              className="btn-primary"
            >
              {loadingNutrition ? 'Loading...' : nutrition ? '✓ Nutrition Loaded' : '📊 Get Nutrition Info'}
            </button>

            {nutrition && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="glass-card p-4">
                  <h4 className="font-bold mb-2 text-sm sm:text-base">Calories</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-primary-600">{nutrition.calories}</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-bold mb-2 text-sm sm:text-base">Health Score</h4>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{nutrition.healthScore}/100</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-bold mb-2 text-sm sm:text-base">Protein</h4>
                  <p className="text-xl sm:text-2xl">{nutrition.macros.protein.amount}g</p>
                </div>
                <div className="glass-card p-4">
                  <h4 className="font-bold mb-2 text-sm sm:text-base">Carbs</h4>
                  <p className="text-xl sm:text-2xl">{nutrition.macros.carbs.amount}g</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recipes;

