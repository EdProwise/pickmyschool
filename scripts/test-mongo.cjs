const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dhirajzope1997_db_user:7XwQh7ClLZ6jZWAy@cluster0.vds4bya.mongodb.net/pickmyschool')
  .then(() => {
    console.log('Connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
