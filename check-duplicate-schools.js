const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool');
  await client.connect();
  const db = client.db('pickmyschool');
  const schools = await db.collection('schools').find({ id: 1 }).toArray();
  console.log('Schools with id=1:', schools.length);
  schools.forEach(s => console.log('_id:', s._id.toString(), 'name:', s.name, 'webhookUrl:', s.whatsappWebhookUrl));
  await client.close();
}

run();
