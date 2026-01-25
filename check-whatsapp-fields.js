const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool');
  
  const schools = mongoose.connection.collection('schools');
  const school = await schools.findOne({ name: /orbit/i });
  
  if (school) {
    console.log('School name:', school.name);
    console.log('School id:', school.id);
    console.log('whatsappWebhookUrl:', JSON.stringify(school.whatsappWebhookUrl));
    console.log('whatsappApiKey:', JSON.stringify(school.whatsappApiKey));
    console.log('typeof whatsappWebhookUrl:', typeof school.whatsappWebhookUrl);
  } else {
    console.log('School not found');
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
