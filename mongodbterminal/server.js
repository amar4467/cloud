const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static('public'));

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
if (!uri) {
  console.error('❌ Error: MongoDB connection string not found. Please set MONGODB_URI or MONGO_URL in your .env file.');
  process.exit(1);
}
const client = new MongoClient(uri);

let itemsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'test_db');
    itemsCollection = db.collection('items');
    console.log(' Successfully connected to MongoDB Atlas!');
  } catch (err) {
    console.error(' MongoDB connection error:', err);
  }
}

// Routes
// 1. Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await itemsCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add a new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const newItem = {
      name,
      description: description || '',
      createdAt: new Date()
    };
    const result = await itemsCollection.insertOne(newItem);
    res.status(201).json({ ...newItem, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Delete an item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await itemsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, async () => {
  await connectDB();
  console.log(` Server is running at http://localhost:${port}`);
});
