const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = "mongodb://ryanhellerud:PUIK6ZFZCXzR7mmh@cluster0-shard-00-00.o4peb.mongodb.net:27017,cluster0-shard-00-01.o4peb.mongodb.net:27017,cluster0-shard-00-02.o4peb.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-tsmkkr-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri, {
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

async function run() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected successfully');
    
    // Find the user with email admin@test.com
    const db = client.db('test');
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ email: 'admin@test.com' });
    
    if (user) {
      console.log('Found user:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
      
      // Update the user to be an admin if they're not already
      if (!user.isAdmin) {
        console.log('Updating user to be an admin...');
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { isAdmin: true } }
        );
        console.log('User updated successfully');
      } else {
        console.log('User is already an admin');
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

run().catch(console.dir); 