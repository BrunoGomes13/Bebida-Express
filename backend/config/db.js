// src/database.js
const dns = require('node:dns');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB!');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    // se quiser ver o erro completo, com todos os detalhes:
    // const util = require('util');
    // console.error(util.inspect(err, { depth: null }));

    process.exit(1);
  }
}

module.exports = connectDB;