import axios from 'axios';

const API_BASE = '/.netlify/functions';

export const recipeAPI = {
  search: async (ingredients, dietary = 'none') => {
    try {
      const response = await axios.post(`${API_BASE}/get-recipes`, {
        ingredients,
        dietary,
      });
      return response.data;
    } catch (error) {
      console.error('Recipe API error:', error);
      throw error;
    }
  },

  getRandom: async (dietary = 'none') => {
    try {
      const response = await axios.post(`${API_BASE}/get-recipes`, {
        ingredients: [],
        dietary,
      });
      return response.data;
    } catch (error) {
      console.error('Random recipe API error:', error);
      throw error;
    }
  },
};

export const nutritionAPI = {
  analyze: async (ingredients, recipe) => {
    try {
      const response = await axios.post(`${API_BASE}/nutrition`, {
        ingredients,
        recipe,
      });
      return response.data;
    } catch (error) {
      console.error('Nutrition API error:', error);
      throw error;
    }
  },
};

export const mealPlanAPI = {
  generate: async (preferences) => {
    try {
      const response = await axios.post(`${API_BASE}/meal-plan`, preferences);
      return response.data;
    } catch (error) {
      console.error('Meal plan API error:', error);
      throw error;
    }
  },
};

export const pantryAPI = {
  get: async (userId = 'default') => {
    try {
      const response = await axios.get(`${API_BASE}/pantry?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Pantry get error:', error);
      throw error;
    }
  },

  add: async (items, userId = 'default') => {
    try {
      const response = await axios.post(`${API_BASE}/pantry?userId=${userId}`, {
        items,
      });
      return response.data;
    } catch (error) {
      console.error('Pantry add error:', error);
      throw error;
    }
  },

  update: async (itemId, updates, userId = 'default') => {
    try {
      const response = await axios.put(`${API_BASE}/pantry?userId=${userId}`, {
        itemId,
        updates,
      });
      return response.data;
    } catch (error) {
      console.error('Pantry update error:', error);
      throw error;
    }
  },

  delete: async (itemId, userId = 'default') => {
    try {
      const response = await axios.delete(`${API_BASE}/pantry?userId=${userId}`, {
        data: { itemId },
      });
      return response.data;
    } catch (error) {
      console.error('Pantry delete error:', error);
      throw error;
    }
  },
};


