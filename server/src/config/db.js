const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/odontochess', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`♟️ [OdontoChess DB] Conectado ao MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ [OdontoChess DB Erro] Falha na conexão: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
