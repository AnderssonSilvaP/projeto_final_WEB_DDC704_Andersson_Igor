const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI não definida');
  const { connection } = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB conectado: ${connection.host}/${connection.name}`);
}

module.exports = connectDB;
