import { MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI;

// Lightweight health check that doesn't fail if MongoDB is unavailable
async function checkMongoDB() {
  if (!MONGO_URI) {
    return { status: 'not_configured', message: 'MONGO_URI not set' };
  }

  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout for health check
    });
    
    // Test connection with a simple operation
    await client.db('chefmind').admin().ping();
    await client.close();
    
    return { status: 'connected', message: 'MongoDB Atlas is active' };
  } catch (error) {
    // Don't fail - MongoDB might be sleeping, but function is still working
    return { 
      status: 'disconnected', 
      message: 'MongoDB connection unavailable (may be sleeping)',
      error: error.message 
    };
  }
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // Always return 200 - function is working
    // MongoDB check is informational only
    const mongoStatus = await checkMongoDB();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Netlify Functions',
        mongodb: mongoStatus,
      }),
    };
  } catch (error) {
    // Even if there's an error, return 200 to indicate function runtime is working
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Netlify Functions',
        mongodb: { status: 'unknown', message: 'Could not check MongoDB status' },
        note: 'Function runtime is operational',
      }),
    };
  }
};

