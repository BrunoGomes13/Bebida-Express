require('dotenv').config();
const { webcrypto } = require('node:crypto');
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { expressMiddleware } = require('@as-integrations/express4');

const conectarBancoDeDados = require('./config/db');
const Administrador = require('./models/Administrador');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const authRoutes = require('./routes/authRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

const { naoEncontrado, tratadorDeErros } = require('./middleware/errorMiddleware');

const iniciarServidor = async () => {
  // 1. Conecta ao MongoDB antes de qualquer outra coisa
  await conectarBancoDeDados();

  const app = express();

  // httpServer "bruto", necessário para o Apollo Server conseguir encerrar
  // as conexões de forma graciosa (ApolloServerPluginDrainHttpServer) quando
  // o processo Node é finalizado.
  const httpServer = http.createServer(app);

  app.use(cors());
  app.use(express.json());

  // 2. Rotas REST (Express)
  app.use('/api/auth', authRoutes);
  app.use('/api/produtos', produtoRoutes);
  app.use('/api/categorias', categoriaRoutes);
  app.use('/api/estoque', estoqueRoutes);
  app.use('/api/vendas', vendaRoutes);

  // 3. Configura o Apollo Server (GraphQL) no caminho /graphql
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await apolloServer.start();

  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(apolloServer, {
      // Roda em toda requisição GraphQL: extrai o administrador logado
      // a partir do token JWT, do mesmo jeito que o authMiddleware faz no REST.
      context: async ({ req }) => {
        let administrador = null;
        const header = req.headers.authorization;

        if (header && header.startsWith('Bearer')) {
          try {
            const token = header.split(' ')[1];
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);
            administrador = await Administrador.findById(decodificado.id).select('-senha');
          } catch (erro) {
            // token inválido/expirado -> administrador continua null;
            // cada resolver decide se exige login ou não.
          }
        }

        return { administrador };
      },
    })
  );

  // 4. Middlewares de erro do REST (sempre por último)
  app.use(naoEncontrado);
  app.use(tratadorDeErros);

  const PORTA = process.env.PORT || 5000;
  await new Promise((resolve) => httpServer.listen({ port: PORTA }, resolve));

  console.log(`Servidor rodando na porta ${PORTA}`);
  console.log(`REST:    http://localhost:${PORTA}/api`);
  console.log(`GraphQL: http://localhost:${PORTA}/graphql`);
};

iniciarServidor();
