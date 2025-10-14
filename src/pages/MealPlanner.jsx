import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function MealPlanner() {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'detailed'
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [preferences, setPreferences] = useState({
    days: 7,
    dietary: 'none',
    budget: 'moderate',
    preferences: '',
  });

  // Load checked items from localStorage when component mounts or user changes
  useEffect(() => {
    if (user && mealPlan) {
      const storageKey = `shoppingList_${user.uid}_${mealPlan.mealPlan.length}days`;
      const savedCheckedItems = localStorage.getItem(storageKey);
      if (savedCheckedItems) {
        try {
          const parsedItems = JSON.parse(savedCheckedItems);
          setCheckedItems(new Set(parsedItems));
        } catch (error) {
          console.error('Error parsing saved checked items:', error);
          setCheckedItems(new Set());
        }
      } else {
        setCheckedItems(new Set());
      }
    }
  }, [user, mealPlan]);

  // Save checked items to localStorage whenever they change
  useEffect(() => {
    if (user && mealPlan && checkedItems.size >= 0) {
      const storageKey = `shoppingList_${user.uid}_${mealPlan.mealPlan.length}days`;
      localStorage.setItem(storageKey, JSON.stringify([...checkedItems]));
    }
  }, [checkedItems, user, mealPlan]);

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/.netlify/functions/meal-plan', preferences);
      setMealPlan(response.data);
      // Reset checked items when generating new meal plan
      setCheckedItems(new Set());
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const checkAllItems = () => {
    if (mealPlan) {
      setCheckedItems(new Set(mealPlan.shoppingList));
    }
  };

  const uncheckAllItems = () => {
    setCheckedItems(new Set());
  };

  const getCheckedCount = () => {
    return checkedItems.size;
  };

  const getTotalItems = () => {
    return mealPlan ? mealPlan.shoppingList.length : 0;
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

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('compact')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Compact Table
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Detailed Cards
              </button>
            </div>
          </div>

          {/* Daily Meals */}
          {viewMode === 'compact' ? (
            <CompactMealTable mealPlan={mealPlan} />
          ) : (
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
          )}

          {/* Shopping List */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold">🛒 Shopping List</h3>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <span className="text-sm text-blue-700">
                    {getCheckedCount()}/{getTotalItems()} checked
                  </span>
                  {getCheckedCount() === getTotalItems() && getTotalItems() > 0 && (
                    <span className="text-green-600">✓</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={checkAllItems}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={getCheckedCount() === getTotalItems()}
                >
                  ✓ Check All
                </button>
                <button 
                  onClick={uncheckAllItems}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={getCheckedCount() === 0}
                >
                  ☐ Uncheck All
                </button>
              </div>
            </div>
            
            <div id="shopping-list" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {mealPlan.shoppingList.map((item, idx) => {
                const isChecked = checkedItems.has(item);
                return (
                  <div 
                    key={idx} 
                    className={`group flex items-center bg-white border-2 p-4 rounded-xl transition-all duration-200 hover:shadow-md ${
                      isChecked 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        id={`item-${idx}`}
                        checked={isChecked}
                        onChange={() => toggleItem(item)}
                        className="sr-only" 
                      />
                      <label 
                        htmlFor={`item-${idx}`}
                        className="flex items-center cursor-pointer w-full"
                      >
                        <div className="relative w-5 h-5 mr-3">
                          <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 flex items-center justify-center ${
                            isChecked 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-300'
                          }`}>
                            <svg 
                              className={`w-3 h-3 text-white transition-opacity duration-200 ${
                                isChecked ? 'opacity-100' : 'opacity-0'
                              }`}
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                          </div>
                        </div>
                        <span className={`capitalize font-medium transition-colors duration-200 ${
                          isChecked 
                            ? 'text-green-700 line-through' 
                            : 'text-gray-800 group-hover:text-blue-600'
                        }`}>
                          {item}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Shopping List Summary */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Total items: <span className="font-semibold text-gray-800">{getTotalItems()}</span></span>
                  <span>Checked: <span className="font-semibold text-green-600">{getCheckedCount()}</span></span>
                  <span>Remaining: <span className="font-semibold text-orange-600">{getTotalItems() - getCheckedCount()}</span></span>
                </div>
                <span>Estimated cost: <span className="font-semibold text-green-600">${mealPlan.estimatedCost}</span></span>
              </div>
              
              {/* Progress Bar */}
              {getTotalItems() > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Shopping Progress</span>
                    <span>{Math.round((getCheckedCount() / getTotalItems()) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(getCheckedCount() / getTotalItems()) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompactMealTable({ mealPlan }) {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const icons = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍎',
  };

  return (
    <div className="card p-6 overflow-x-auto">
      <div className="min-w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-2 font-bold text-gray-700">Day</th>
              {mealTypes.map(mealType => (
                <th key={mealType} className="text-center py-3 px-2 font-bold text-gray-700">
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{icons[mealType]}</span>
                    <span className="text-xs capitalize">{mealType}</span>
                  </div>
                </th>
              ))}
              <th className="text-center py-3 px-2 font-bold text-gray-700">Total</th>
            </tr>
          </thead>
          <tbody>
            {mealPlan.mealPlan.map((day, dayIdx) => (
              <tr key={dayIdx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 font-bold text-gray-900">
                  {day.day}
                </td>
                {mealTypes.map(mealType => {
                  const meal = day.meals[mealType];
                  return (
                    <td key={mealType} className="py-3 px-2 text-center">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-900 leading-tight">
                          {meal.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {meal.calories} cal
                        </div>
                      </div>
                    </td>
                  );
                })}
                <td className="py-3 px-2 text-center font-bold text-gray-900">
                  {day.totalCalories}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

