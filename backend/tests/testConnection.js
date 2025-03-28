const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb://ryanhellerud:PUIK6ZFZCXzR7mmh@cluster0-shard-00-00.o4peb.mongodb.net:27017,cluster0-shard-00-01.o4peb.mongodb.net:27017,cluster0-shard-00-02.o4peb.mongodb.net:27017/admin?ssl=true&replicaSet=atlas-tsmkkr-shard-0&authSource=admin&retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    console.log('Using standard connection URI');
    await client.connect();
    console.log('Connected successfully');
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

run().catch(console.dir); 