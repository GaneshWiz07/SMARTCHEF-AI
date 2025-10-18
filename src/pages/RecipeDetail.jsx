import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Youtube, Check, BarChart3, Clock, Users, ChefHat } from 'lucide-react';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  const fetchRecipeDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch single recipe by ID
      const response = await axios.post('/.netlify/functions/get-recipe-by-id', {
        id: id
      });
      
      if (response.data.recipe) {
        setRecipe(response.data.recipe);
      } else {
        setError('Recipe not found');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      if (error.response?.status === 404) {
        setError('Recipe not found');
      } else {
        setError('Failed to load recipe details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNutrition = async () => {
    if (!recipe) return;
    
    setLoadingNutrition(true);
    try {
      const ingredientStrings = recipe.ingredients.map(
        ing => `${ing.measure} ${ing.name}`
      );
      const response = await axios.post('/.netlify/functions/nutrition', {
        ingredients: ingredientStrings,
        recipe: { 
          id: recipe.id,
          name: recipe.name,
          healthScore: recipe.healthScore
        },
      });
      setNutrition(response.data.nutrition);
    } catch (error) {
      console.error('Error fetching nutrition:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <ChefHat className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          <p className="text-lg text-gray-700 font-medium">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <Link to="/recipes" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 opacity-25" 
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1495195134817-aeb325a55b65?w=1920&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-primary-50/30 to-blue-50/40"></div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
      {/* Back Button */}
      <button
        onClick={() => navigate('/recipes')}
        className="flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Recipes</span>
      </button>

      {/* Recipe Header */}
      <div className="glass-card overflow-hidden">
        {/* Recipe Image */}
        <div className="relative h-64 sm:h-96 overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {recipe.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {recipe.category && (
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-700 rounded-full text-sm font-medium">
                  {recipe.category}
                </span>
              )}
              {recipe.area && (
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-sm font-medium">
                  {recipe.area}
                </span>
              )}
              {recipe.source === 'Edamam' && (
                <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white rounded-full text-sm font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Recipe Meta Info - Clean Format */}
          {(recipe.prepTime || recipe.cookTime || recipe.servings) && (
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-gray-200">
              {recipe.prepTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <span className="text-lg font-bold text-gray-800">{recipe.prepTime} min</span>
                    <span className="text-sm text-gray-500 ml-1">prep</span>
                  </div>
                </div>
              )}
              {recipe.cookTime && (
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-600" />
                  <div>
                    <span className="text-lg font-bold text-gray-800">{recipe.cookTime} min</span>
                    <span className="text-sm text-gray-500 ml-1">cook</span>
                  </div>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-lg font-bold text-gray-800">Serves {recipe.servings}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Two Column Layout for Desktop */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Ingredients */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{ing.measure}</span>
                      <span className="ml-2 text-gray-600">{ing.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column - Instructions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  📝
                </div>
                Instructions
              </h2>
              <InstructionSteps instructions={recipe.instructions} />
            </div>
          </div>

          {/* Video Tutorial */}
          {recipe.video && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-4">Video Tutorial</h2>
              <a
                href={recipe.video}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2"
              >
                <Youtube className="w-5 h-5" /> Watch on YouTube
              </a>
            </div>
          )}

          {/* Nutrition Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Nutrition Information</h2>
            
            {!nutrition ? (
              <button
                onClick={fetchNutrition}
                disabled={loadingNutrition}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loadingNutrition ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5" /> Get Nutrition Info
                  </>
                )}
              </button>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Calories</p>
                  <p className="text-3xl font-bold text-primary-600">{nutrition.calories}</p>
                  <p className="text-xs text-gray-400 mt-1">kcal</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Protein</p>
                  <p className="text-3xl font-bold text-blue-600">{nutrition.macros.protein.amount}g</p>
                  <p className="text-xs text-gray-400 mt-1">per serving</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Carbs</p>
                  <p className="text-3xl font-bold text-orange-600">{nutrition.macros.carbs.amount}g</p>
                  <p className="text-xs text-gray-400 mt-1">per serving</p>
                </div>
                <div className="glass-card p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Health Score</p>
                  <p className="text-3xl font-bold text-green-600">{nutrition.healthScore}</p>
                  <p className="text-xs text-gray-400 mt-1">out of 100</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function InstructionSteps({ instructions }) {
  const parseInstructions = (text) => {
    if (!text) return [];
    
    let steps = [];
    
    // Check if text already has numbered steps
    if (/^\d+[\.\)\:]\s|^Step\s+\d+/im.test(text)) {
      // Split by step numbers and clean them
      steps = text.split(/(?=\d+[\.\)\:]\s)|(?=Step\s+\d+)/i)
        .filter(step => step.trim().length > 0)
        .map(step => {
          // Remove all common step number patterns at the start
          return step
            .replace(/^\d+[\.\)\:]\s*/i, '') // Remove "1. " or "1) " or "1: "
            .replace(/^Step\s+\d+[:\.\)\s]*/i, '') // Remove "Step 1: "
            .trim();
        })
        .filter(step => step.length > 0); // Remove any empty steps after cleaning
    } 
    // Check if text has line breaks
    else if (text.includes('\n')) {
      steps = text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 20);
    } 
    // Check if text has sentence-like structure
    else if (/\.\s+[A-Z]/.test(text)) {
      steps = text.split(/\.\s+(?=[A-Z])/)
        .map(step => step.trim())
        .filter(step => step.length > 0)
        .map(step => step.endsWith('.') ? step : step + '.');
    } 
    // Single instruction block
    else {
      steps = [text.trim()];
    }
    
    return steps.filter(step => step.length > 0);
  };
  
  const steps = parseInstructions(instructions);
  
  if (steps.length === 1 && steps[0].length > 200) {
    const sentences = steps[0].split(/\.\s+/)
      .filter(s => s.trim().length > 20)
      .map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
    if (sentences.length > 1) {
      return (
        <ol className="space-y-4">
          {sentences.map((sentence, index) => (
            <li key={index} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </span>
              <p className="text-gray-700 flex-1 pt-1.5 leading-relaxed">{sentence}</p>
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
          <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {index + 1}
          </span>
          <p className="text-gray-700 flex-1 pt-1.5 leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}

export default RecipeDetail;
