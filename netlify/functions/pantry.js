import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables. Please add it to your .env file.');
  }

  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    console.log('Pantry function called:', event.httpMethod, event.queryStringParameters);
    
    const client = await connectToDatabase();
    const db = client.db('chefmind');
    const pantryCollection = db.collection('pantry');

    const userId = event.queryStringParameters?.userId || 'default';

    switch (event.httpMethod) {
      case 'GET': {
        // Get user's pantry
        const pantry = await pantryCollection.findOne({ userId });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            pantry: pantry?.items || [],
            lastUpdated: pantry?.lastUpdated || null,
          }),
        };
      }

      case 'POST': {
        // Add items to pantry
        const { items } = JSON.parse(event.body);
        
        const result = await pantryCollection.updateOne(
          { userId },
          {
            $set: { lastUpdated: new Date() },
            $addToSet: { items: { $each: items } },
          },
          { upsert: true }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'Items added to pantry',
            modifiedCount: result.modifiedCount,
          }),
        };
      }

      case 'PUT': {
        // Update pantry item
        const { itemId, updates } = JSON.parse(event.body);
        
        const result = await pantryCollection.updateOne(
          { userId, 'items.id': itemId },
          { 
            $set: { 
              'items.$': { ...updates, id: itemId },
              lastUpdated: new Date(),
            },
          }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'Item updated',
            modifiedCount: result.modifiedCount,
          }),
        };
      }

      case 'DELETE': {
        // Remove item from pantry
        const { itemId } = JSON.parse(event.body);
        
        const result = await pantryCollection.updateOne(
          { userId },
          { 
            $pull: { items: { id: itemId } },
            $set: { lastUpdated: new Date() },
          }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true,
            message: 'Item removed',
            modifiedCount: result.modifiedCount,
          }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Error accessing pantry:', error);
    
    // Check if it's a MongoDB connection error
    let errorMessage = 'Failed to access pantry';
    if (error.message.includes('MONGO_URI')) {
      errorMessage = error.message;
    } else if (error.message.includes('connect')) {
      errorMessage = 'Cannot connect to MongoDB. Please check your MONGO_URI configuration.';
    } else {
      errorMessage = error.message;
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        hint: 'Check if MONGO_URI is set in your .env file and the server has been restarted.'
      }),
    };
  }
};

