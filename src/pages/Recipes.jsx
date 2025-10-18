import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipesContext';
import IngredientInput from '../components/IngredientInput';
import RecipeCard from '../components/RecipeCard';
import DietaryFilter from '../components/DietaryFilter';
import RegionFilter from '../components/RegionFilter';
import axios from 'axios';
import { Sparkles, Utensils, Search, Salad, UtensilsCrossed, BarChart3, BookOpen, PartyPopper, Frown } from 'lucide-react';

function Recipes() {
  const navigate = useNavigate();
  const {
    recipes,
    setRecipes,
    ingredients,
    setIngredients,
    dietary,
    setDietary,
    region,
    setRegion,
    canLoadMore,
    setCanLoadMore,
    noMoreRecipes,
    setNoMoreRecipes,
    hasSearched,
    setHasSearched,
    clearRecipes,
  } = useRecipes();
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Handler for dietary filter change - clears recipes
  const handleDietaryChange = (newDietary) => {
    setDietary(newDietary);
    clearRecipes();
  };

  // Handler for region filter change - clears recipes
  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
    clearRecipes();
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
          // Always allow loading more unless we got 0 recipes
          setCanLoadMore(true);
          setNoMoreRecipes(false);
        }
      } else {
        setRecipes(newRecipes);
        // Always show load more button initially if we got any recipes
        setCanLoadMore(newRecipes.length > 0);
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
          // Always allow loading more unless we got 0 recipes
          setCanLoadMore(true);
          setNoMoreRecipes(false);
        }
      } else {
        setRecipes(newRecipes);
        // Always show load more button initially if we got any recipes
        setCanLoadMore(newRecipes.length > 0);
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
              className="bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-700 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Generate
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Utensils className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <p className="mt-6 text-lg text-gray-700 font-medium">
            {ingredients.length > 0 
              ? `Searching recipes with ${ingredients.join(', ')}...`
              : 'Finding delicious recipes...'
            }
          </p>
          <div className="mt-3 flex justify-center gap-1">
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && recipes.length > 0 && (
        <div className="relative px-6 py-8 rounded-3xl overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 -z-0">
            <div 
              className="absolute inset-0 opacity-10" 
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-primary-50/40 to-blue-50/60 backdrop-blur-3xl"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-bold">
              Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {ingredients.length > 0 && (
                <div className="px-4 py-2 bg-green-100/80 backdrop-blur-sm text-green-700 rounded-lg font-medium text-sm border border-green-200/50 flex items-center gap-2">
                  <Salad className="w-4 h-4" /> With: {ingredients.join(', ')}
                </div>
              )}
              {dietary !== 'none' && (
                <div className="px-4 py-2 bg-primary-100/80 backdrop-blur-sm text-primary-700 rounded-lg font-medium text-sm border border-primary-200/50">
                  Diet: {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
                </div>
              )}
              {region !== 'all' && (
                <div className="px-4 py-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 rounded-lg font-medium text-sm border border-blue-200/50">
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
                onClick={() => navigate(`/recipe/${recipe.id}`)}
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
                  <>
                    <BookOpen className="w-5 h-5" /> Load More Recipes
                  </>
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
              <div className="flex justify-center mb-3">
                <PartyPopper className="w-12 h-12 text-primary-600" />
              </div>
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
        </div>
      )}

      {/* No Results - Only show after searching and getting 0 results */}
      {!loading && recipes.length === 0 && hasSearched && (
        <div className="text-center py-12 glass-card p-8">
          <div className="flex justify-center mb-4">
            <Frown className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
          </div>
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
          <div className="flex justify-center mb-4">
            <Search className="w-20 h-20 text-gray-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Ready to find recipes?</h3>
          <p className="text-gray-600 mb-6">
            Enter ingredients you have or click &quot;<Sparkles className="w-4 h-4 inline" /> Generate&quot; for random suggestions
          </p>
          <div className="flex gap-2 justify-center flex-wrap text-sm text-gray-500">
            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
              <Salad className="w-3 h-3" /> 50+ Cuisines
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
              <UtensilsCrossed className="w-3 h-3" /> Multiple Diets
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> Nutrition Info
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;

