import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function MealPlanner() {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    days: 7,
    dietary: 'none',
    budget: 'moderate',
    preferences: '',
  });

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/.netlify/functions/meal-plan', preferences);
      setMealPlan(response.data);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center px-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-4 py-2 rounded-full mb-4">
          <span className="text-lg sm:text-xl">🤖</span>
          <span className="text-xs sm:text-sm font-bold">AI-POWERED</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Meal Planner</h1>
        <p className="text-sm sm:text-base text-gray-600">Let our AI create personalized meal plans optimized for your dietary goals, budget, and preferences</p>
      </div>

      {/* Preferences Form */}
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold mb-4">Your Preferences</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Number of Days</label>
            <select
              value={preferences.days}
              onChange={(e) => setPreferences({ ...preferences, days: parseInt(e.target.value) })}
              className="input-field"
            >
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Dietary Preference</label>
            <select
              value={preferences.dietary}
              onChange={(e) => setPreferences({ ...preferences, dietary: e.target.value })}
              className="input-field"
            >
              <option value="none">No Preference</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="low-carb">Low Carb</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Budget</label>
            <select
              value={preferences.budget}
              onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
              className="input-field"
            >
              <option value="low">Low ($5-10/day)</option>
              <option value="moderate">Moderate ($10-15/day)</option>
              <option value="high">High ($15-25/day)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Additional Preferences</label>
            <input
              type="text"
              value={preferences.preferences}
              onChange={(e) => setPreferences({ ...preferences, preferences: e.target.value })}
              placeholder="e.g., high protein, low sodium"
              className="input-field"
            />
          </div>
        </div>

        <button
          onClick={generateMealPlan}
          disabled={loading}
          className="btn-primary mt-6 w-full text-lg flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>AI is creating your meal plan...</span>
            </>
          ) : (
            <>
              <span>🤖</span>
              <span>Generate AI Meal Plan</span>
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin text-6xl">⏳</div>
          <p className="mt-4 text-gray-600">Creating your personalized meal plan...</p>
        </div>
      )}

      {/* Meal Plan Display */}
      {mealPlan && !loading && (
        <div className="space-y-8">
          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <div className="text-3xl mb-2">📅</div>
              <div className="font-bold text-2xl">{preferences.days} Days</div>
              <div className="text-gray-600">Planned</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="font-bold text-2xl">${mealPlan.estimatedCost}</div>
              <div className="text-gray-600">Estimated Cost</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-bold text-2xl">{mealPlan.nutritionSummary?.avgCaloriesPerDay || 'N/A'}</div>
              <div className="text-gray-600">Avg Calories/Day</div>
            </div>
          </div>

          {/* Daily Meals */}
          <div className="space-y-6">
            {mealPlan.mealPlan.map((day, idx) => (
              <div key={idx} className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">{day.day}</h3>
                  <span className="text-gray-600">{day.totalCalories} calories</span>
                </div>
                
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {Object.entries(day.meals).map(([mealType, meal]) => (
                    <MealCard key={mealType} mealType={mealType} meal={meal} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Shopping List */}
          <div className="card p-6">
            <h3 className="text-2xl font-bold mb-4">🛒 Shopping List</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {mealPlan.shoppingList.map((item, idx) => (
                <div key={idx} className="flex items-center bg-gray-50 p-3 rounded-lg">
                  <input type="checkbox" className="mr-3" />
                  <span className="capitalize">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MealCard({ mealType, meal }) {
  const icons = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍎',
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-2xl mb-2">{icons[mealType]}</div>
      <div className="font-bold capitalize mb-1">{mealType}</div>
      <div className="text-sm text-gray-700 mb-2">{meal.name}</div>
      <div className="text-xs text-gray-500">{meal.calories} cal</div>
    </div>
  );
}

export default MealPlanner;

