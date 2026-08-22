const mongoose = require('mongoose');

// Responsável por abrir a conexão com o MongoDB usando Mongoose.
// É chamada uma única vez, na inicialização do servidor (server.js).
const conectarBancoDeDados = async () => {
  try {
    const conexao = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${conexao.connection.host}`);
  } catch (erro) {
    console.error(`Erro ao conectar ao MongoDB: ${erro.message}`);
    process.exit(1); // encerra o processo se não conseguir conectar ao banco
  }
};

module.exports = conectarBancoDeDados;
