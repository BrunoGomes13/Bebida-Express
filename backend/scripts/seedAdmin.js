require('dotenv').config();
const mongoose = require('mongoose');
const conectarBancoDeDados = require('../config/db');
const Administrador = require('../models/Administrador');

const criarAdminInicial = async () => {
  await conectarBancoDeDados();

  const emailPadrao = process.env.ADMIN_EMAIL || 'admin@bebidaexpress.com';
  const senhaPadrao = process.env.ADMIN_SENHA || 'admin123';

  const existente = await Administrador.findOne({ email: emailPadrao });

  if (existente) {
    console.log('Já existe um administrador com esse e-mail.');
  } else {
    await Administrador.create({
      nome: 'Administrador',
      email: emailPadrao,
      senha: senhaPadrao,
    });
    console.log(`Administrador criado com sucesso!`);
    console.log(`E-mail: ${emailPadrao}`);
    console.log(`Senha:  ${senhaPadrao}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

criarAdminInicial();