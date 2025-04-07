const { MongoClient } = require('mongodb');

const uri = "mongodb://127.0.0.1:27017";
const dbName = "liveinnovator";
const collectionName = "templates";

const sections1 = [
    { id: 'says', title: 'Says', color: '#FFEE93', x: 1, y: 1 },
    { id: 'thinks', title: 'Thinks', color: '#ADF7B6', x: -1, y: 1 },
    { id: 'feels', title: 'Feels', color: '#FFC09F', x: -1, y: -1 },
    { id: 'does', title: 'Does', color: '#A0CED9', x: 1, y: -1 }
  ];
  
  const sections2 = [
    { id: 'sees', title: 'Sees', color: '#D3F8E2', x: 1, y: 1 },
    { id: 'hears', title: 'Hears', color: '#E4C1F9', x: -1, y: 1 },
    { id: 'says', title: 'Says', color: '#FCF6BD', x: -1, y: -1 },
    { id: 'pains', title: 'Pains', color: '#F694C1', x: 1, y: -1 }
  ];

// Documents to insert
const templates = [
  {
    sessionName: "Empathy Map Session 1",
    sections: sections1
  },
  {
    sessionName: "Empathy Map Session 2",
    sections: sections2
  }
];

async function insertTemplates() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertMany(templates);
    console.log(`${result.insertedCount} documents inserted`);
  } catch (err) {
    console.error("Error inserting documents:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

insertTemplates();
