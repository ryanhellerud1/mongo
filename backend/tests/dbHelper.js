const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

let client;

const connectDB = async () => {
  try {
    const uri = "mongodb://ryanhellerud:PUIK6ZFZCXzR7mmh@cluster0-shard-00-00.o4peb.mongodb.net:27017,cluster0-shard-00-01.o4peb.mongodb.net:27017,cluster0-shard-00-02.o4peb.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-tsmkkr-shard-0&authSource=admin&retryWrites=true&w=majority";
    
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10
    });
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const closeDB = async () => {
  try {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, closeDB }; 