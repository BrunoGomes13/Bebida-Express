// src/database.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB!');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    // se quiser ver o erro completo, com todos os detalhes:
    // const util = require('util');
    // console.error(util.inspect(err, { depth: null }));
  }
}

module.exports = connectDB;