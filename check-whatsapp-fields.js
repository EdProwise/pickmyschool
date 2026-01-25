const mongoose = require('mongoose');
const { Schema } = mongoose;

async function testMongooseUpdate() {
  await mongoose.connect('mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool');
  
  // Define a minimal school schema
  const SchoolSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    board: { type: String, required: true },
    city: { type: String, required: true },
    whatsappWebhookUrl: String,
    whatsappApiKey: String,
  }, { timestamps: true, strict: false });

  const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
  
  console.log('Before update:');
  const before = await School.findOne({ id: 1 });
  console.log('whatsappWebhookUrl:', before?.whatsappWebhookUrl);
  
  console.log('\nPerforming Mongoose updateOne...');
  const result = await School.updateOne(
    { id: 1 },
    { $set: { whatsappWebhookUrl: 'https://mongoose-test.com/webhook' } }
  );
  console.log('Update result:', result);
  
  console.log('\nAfter update:');
  const after = await School.findOne({ id: 1 });
  console.log('whatsappWebhookUrl:', after?.whatsappWebhookUrl);
  
  await mongoose.disconnect();
}

testMongooseUpdate().catch(console.error);
