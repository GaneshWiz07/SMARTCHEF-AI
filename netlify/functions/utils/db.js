import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('chefmind');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export const collections = {
  pantry: 'pantry',
  users: 'users',
  mealPlans: 'mealPlans',
  savedRecipes: 'savedRecipes',
};

// Schema validation functions
export function validatePantryItem(item) {
  if (!item.name || typeof item.name !== 'string') {
    throw new Error('Invalid pantry item: name is required');
  }
  if (!item.quantity) {
    throw new Error('Invalid pantry item: quantity is required');
  }
  return true;
}

export function validateMealPlan(plan) {
  if (!plan.mealPlan || !Array.isArray(plan.mealPlan)) {
    throw new Error('Invalid meal plan: mealPlan array is required');
  }
  return true;
}


