# 🥤 Bebida Express

Sistema web de controle de estoque e registro de vendas para estabelecimentos que comercializam bebidas, desenvolvido com **Node.js/Express** no backend (**REST + GraphQL**), banco de dados **MongoDB Atlas** e autenticação **JWT**. O sistema é de **uso exclusivamente administrativo** — não existe área pública ou cadastro de clientes. O frontend (React) está previsto para a **Fase 2** do projeto.

## 👥 Integrantes do Grupo

- Alan Bezerra Chagas
- Bruno Gomes de Albuquerque Costa
- Daniel Tavares de Almeida
- Ivys Oliveira Dantas

## 📋 Descrição da Aplicação

O **Bebida Express** nasceu para resolver um problema comum em estabelecimentos que vendem bebidas: o controle de estoque feito manualmente (planilhas, anotações), que gera erros de contagem, estoque desatualizado e risco de vender produtos sem quantidade suficiente.

O sistema permite que o administrador:

- Cadastre **produtos** e **categorias**, controlando preço, quantidade em estoque e estoque mínimo.
- Registre **vendas** selecionando vários produtos e quantidades de uma vez.
- Receba a **baixa automática no estoque** assim que a venda é confirmada — sem precisar atualizar manualmente.
- Consulte o **histórico de vendas** e de **movimentações de estoque** (o "porquê" da quantidade atual de cada produto).
- Identifique produtos com **estoque baixo** ou **esgotado**.

A regra central do sistema: toda vez que uma venda é registrada, os produtos vendidos têm suas quantidades automaticamente descontadas do estoque, dentro de uma **transação** — se um dos produtos não tiver estoque suficiente, nada é gravado.

## 🛠️ Tecnologias Utilizadas

### Backend

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | — | Runtime JavaScript |
| Express | ^4.22.2 | Framework HTTP / API REST |
| @apollo/server | ^5.5.1 | Servidor GraphQL |
| @as-integrations/express4 | ^1.1.2 | Integração do Apollo Server com Express |
| graphql | ^16.11.0 | Linguagem de consulta GraphQL |
| Mongoose | ^8.4.1 | ODM para MongoDB |
| MongoDB Atlas | — | Banco de dados em nuvem (NoSQL) |
| jsonwebtoken | ^9.0.2 | Autenticação via JWT |
| bcryptjs | ^2.4.3 | Hash de senhas |
| dotenv | ^16.4.5 | Variáveis de ambiente |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| nodemon | ^3.1.3 | Reinício automático (dev) |

### Frontend (Fase 2 — ainda não implementado)

| Tecnologia | Uso previsto |
|---|---|
| React | Interface administrativa (login, dashboard, produtos, estoque, vendas, movimentações) |

## 📁 Estrutura do Projeto

```
bebida-express-backend/
├── config/
│   └── db.js                     # Conexão com MongoDB Atlas
├── controllers/
│   ├── authController.js         # Login do administrador
│   ├── categoriaController.js    # CRUD de categorias
│   ├── produtoController.js      # CRUD de produtos
│   ├── estoqueController.js      # Consulta de estoque
│   └── vendaController.js        # Registro e consulta de vendas
├── graphql/
│   ├── typeDefs.js                # Schema GraphQL (types, Query, Mutation)
│   └── resolvers.js               # Resolvers do Apollo Server
├── middleware/
│   ├── authMiddleware.js          # Verificação de token JWT (rotas REST)
│   └── errorMiddleware.js         # Tratamento global de erros (404 e 500)
├── models/
│   ├── Administrador.js           # Schema de Administrador (com hash de senha)
│   ├── Categoria.js                # Schema de Categoria
│   ├── Produto.js                  # Schema de Produto (com status de estoque)
│   ├── Venda.js                    # Schema de Venda
│   ├── ItemVenda.js                # Schema dos itens de cada venda
│   └── Movimentacao.js             # Schema do histórico de movimentações de estoque
├── routes/
│   ├── authRoutes.js               # Rotas /api/auth
│   ├── categoriaRoutes.js          # Rotas /api/categorias
│   ├── produtoRoutes.js            # Rotas /api/produtos
│   ├── estoqueRoutes.js            # Rotas /api/estoque
│   └── vendaRoutes.js              # Rotas /api/vendas
├── scripts/
│   └── seedAdmin.js                # Cria o administrador inicial
├── services/
│   └── vendaService.js             # Regra de negócio central: venda + baixa automática
├── utils/
│   └── gerarToken.js               # Geração do token JWT
├── .env.example
├── server.js                       # Inicialização do Express + Apollo Server (GraphQL)
└── package.json
```

## 🔌 Endpoints da API

A API roda em `http://localhost:5000`. Rotas REST partem de `/api`; GraphQL fica disponível em `/graphql`.

🔓 Público — acessível sem autenticação
🔒 Privado — requer token JWT (`Authorization: Bearer <token>`)

### 🔐 Autenticação — `/api/auth`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/auth/login | 🔓 Público | Realiza login do administrador e retorna o JWT |

### 🗂️ Categorias — `/api/categorias`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/categorias | 🔒 Privado | Cadastra uma nova categoria |
| GET | /api/categorias | 🔒 Privado | Lista todas as categorias |
| GET | /api/categorias/:id | 🔒 Privado | Busca uma categoria por ID |
| PUT | /api/categorias/:id | 🔒 Privado | Atualiza uma categoria |
| DELETE | /api/categorias/:id | 🔒 Privado | Inativa uma categoria |

### 🥤 Produtos — `/api/produtos`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/produtos | 🔒 Privado | Cadastra um novo produto |
| GET | /api/produtos | 🔒 Privado | Lista produtos (filtros: `?categoria=&status=&busca=`) |
| GET | /api/produtos/:id | 🔒 Privado | Busca um produto por ID |
| PUT | /api/produtos/:id | 🔒 Privado | Atualiza um produto |
| DELETE | /api/produtos/:id | 🔒 Privado | Inativa um produto |

### 📦 Estoque — `/api/estoque`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | /api/estoque | 🔒 Privado | Lista o estoque de todos os produtos ativos (com status: normal/estoque_baixo/esgotado) |
| GET | /api/estoque/:produtoId | 🔒 Privado | Consulta o estoque de um produto específico |

### 🧾 Vendas — `/api/vendas`

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | /api/vendas | 🔒 Privado | Registra uma venda (com baixa automática de estoque) |
| GET | /api/vendas | 🔒 Privado | Lista o histórico de vendas |
| GET | /api/vendas/:id | 🔒 Privado | Detalha uma venda e seus itens |

### 🔮 GraphQL — `/graphql`

| Tipo | Operação | Acesso | Descrição |
|---|---|---|---|
| Query | produtos | 🔓 | Lista produtos ativos |
| Query | produto(id) | 🔓 | Busca um produto por ID |
| Query | categorias | 🔓 | Lista categorias |
| Query | estoque | 🔓 | Lista o estoque com status |
| Query | vendas | 🔓 | Lista vendas |
| Query | venda(id) | 🔓 | Busca uma venda por ID |
| Mutation | registrarVenda(itens) | 🔒 Privado | Registra uma venda com baixa automática (exige JWT no header `Authorization`) |

## 🗄️ Modelagem do Banco de Dados

Banco de dados **MongoDB Atlas** (NoSQL), gerenciado via Mongoose. As coleções e seus campos:

### 📦 Coleção `administradors`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| nome | String | ✅ | Nome do administrador |
| email | String | ✅ | E-mail único (lowercase) |
| senha | String | ✅ | Senha com hash bcrypt |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

### 📦 Coleção `categorias`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| nome | String | ✅ | Nome da categoria (único) |
| descricao | String | ❌ | Descrição da categoria |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

### 📦 Coleção `produtos`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| codigo | String | ✅ | Código único do produto |
| nome | String | ✅ | Nome do produto |
| descricao | String | ❌ | Descrição do produto |
| categoria | ObjectId (ref: Categoria) | ✅ | Categoria do produto |
| preco | Number | ✅ | Preço de venda |
| quantidadeEstoque | Number | ✅ | Quantidade disponível (padrão: 0) |
| estoqueMinimo | Number | ✅ | Quantidade mínima antes de virar "estoque baixo" (padrão: 5) |
| imagem | String | ❌ | URL da imagem |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |
| statusEstoque | Virtual (calculado) | — | "normal" \| "estoque_baixo" \| "esgotado" |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

### 📦 Coleção `vendas`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| data | Date | ❌ | Data da venda (padrão: agora) |
| valorTotal | Number | ✅ | Valor total calculado da venda |
| administrador | ObjectId (ref: Administrador) | ✅ | Quem registrou a venda |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

### 📦 Coleção `itemvendas`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| venda | ObjectId (ref: Venda) | ✅ | Venda à qual o item pertence |
| produto | ObjectId (ref: Produto) | ✅ | Produto vendido |
| quantidade | Number | ✅ | Quantidade vendida |
| precoUnitario | Number | ✅ | Preço unitário no momento da venda |
| subtotal | Number | ✅ | quantidade × precoUnitario |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

### 📦 Coleção `movimentacaos`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| produto | ObjectId (ref: Produto) | ✅ | Produto que teve o estoque alterado |
| venda | ObjectId (ref: Venda) | ❌ | Venda que originou a movimentação |
| tipo | String (enum) | ✅ | "entrada" \| "saida" |
| quantidade | Number | ✅ | Quantidade movimentada |
| estoqueAnterior | Number | ✅ | Estoque antes da movimentação |
| estoquePosterior | Number | ✅ | Estoque depois da movimentação |
| administrador | ObjectId (ref: Administrador) | ✅ | Responsável pela movimentação |
| createdAt / updatedAt | Date | — | Gerados automaticamente |

## ▶️ Instruções para Rodar o Projeto

### Pré-requisitos

- Node.js 18 ou superior
- Conta no MongoDB Atlas com cluster configurado (o cluster precisa rodar como Replica Set — o Atlas já vem assim por padrão — pois o registro de venda usa transações)
- Gerenciador de pacotes npm

### 🔧 Backend

**1.** Acesse a pasta do projeto:
```bash
cd bebida-express-backend
```

**2.** Instale as dependências:
```bash
npm install
```

**3.** Crie o arquivo `.env` na raiz do projeto (baseado no `.env.example`) com as seguintes variáveis:
```
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb_atlas
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@bebidaexpress.com
ADMIN_SENHA=admin123
```

**4.** No MongoDB Atlas, libere seu IP em **Network Access** (ou use "Allow Access from Anywhere" em desenvolvimento).

**5.** Crie o administrador inicial (não existe cadastro público de usuários):
```bash
npm run seed:admin
```

**6.** Inicie o servidor:
```bash
npm start
```
Para desenvolvimento com reinício automático, use `npm run dev`.

O servidor estará disponível em:
- **REST**: http://localhost:5000/api
- **GraphQL**: http://localhost:5000/graphql (abre o Apollo Sandbox no navegador)

### 🖥️ Frontend

Ainda não implementado — previsto para a **Fase 2** do projeto, utilizando **React**, consumindo tanto a API REST quanto o GraphQL já disponíveis no backend.

## 🔑 Acesso ao Sistema

Após rodar `npm run seed:admin`, faça login com o e-mail e senha definidos no `.env` (`ADMIN_EMAIL` / `ADMIN_SENHA`):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bebidaexpress.com","senha":"admin123"}'
```

O token JWT retornado deve ser enviado no header `Authorization: Bearer <token>` em todas as demais rotas privadas (REST e GraphQL).
