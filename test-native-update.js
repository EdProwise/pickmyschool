const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool');
  await client.connect();
  const db = client.db('pickmyschool');
  
  // Update using native driver
  const result = await db.collection('schools').findOneAndUpdate(
    { id: 1 },
    { $set: { 
      whatsappWebhookUrl: 'https://test-native-driver.com/webhook',
      whatsappApiKey: 'test_key_123',
      updatedAt: new Date().toISOString()
    }},
    { returnDocument: 'after' }
  );
  
  console.log('Update result:', result);
  
  // Verify
  const school = await db.collection('schools').findOne({ id: 1 });
  console.log('After update - webhookUrl:', school.whatsappWebhookUrl);
  console.log('After update - apiKey:', school.whatsappApiKey);
  
  await client.close();
}

run();
