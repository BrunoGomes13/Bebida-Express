# Bebida Express — Backend (Fase 1)

Backend do sistema de controle de estoque e registro de vendas **Bebida Express**.

Stack: **Node.js + Express** (REST) · **Apollo Server 5** (GraphQL) · **MongoDB + Mongoose** · **JWT**.

## 1. Pré-requisitos

- Node.js 18 ou superior
- Uma instância do MongoDB. Duas opções:
  - **MongoDB Atlas** (gratuito, recomendado — já roda como Replica Set, necessário para as transações usadas no registro de venda): https://www.mongodb.com/atlas
  - **MongoDB local**, rodando como Replica Set de um único nó (necessário para `mongoose.startSession()` funcionar):
    ```bash
    mongod --replSet rs0 --dbpath /caminho/para/dados
    # em outro terminal, uma única vez:
    mongosh --eval "rs.initiate()"
    ```

## 2. Instalação

```bash
npm install
cp .env.example .env
# edite o .env e preencha MONGO_URI e JWT_SECRET
```

## 3. Criar o administrador inicial

Como o sistema não tem cadastro público (só o administrador usa o sistema):

```bash
npm run seed:admin
```

Isso cria um administrador com o e-mail/senha definidos em `ADMIN_EMAIL` / `ADMIN_SENHA` no `.env`
(padrão: `admin@bebidaexpress.com` / `admin123`).

## 4. Rodar o servidor

```bash
npm run dev     # com nodemon (reinicia sozinho a cada alteração)
# ou
npm start
```

Você verá:

```
Servidor rodando na porta 5000
REST:    http://localhost:5000/api
GraphQL: http://localhost:5000/graphql
```

## 5. Testando a API

### Login (REST)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bebidaexpress.com","senha":"admin123"}'
```
Copie o `token` da resposta e use nas próximas chamadas como header:
`Authorization: Bearer SEU_TOKEN_AQUI`

### Criar categoria e produto
```bash
curl -X POST http://localhost:5000/api/categorias \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Refrigerantes"}'

curl -X POST http://localhost:5000/api/produtos \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -d '{"codigo":"BEV001","nome":"Coca-Cola 2L","categoria":"ID_DA_CATEGORIA","preco":10,"quantidadeEstoque":30,"estoqueMinimo":10}'
```

### Registrar uma venda (baixa automática no estoque)
```bash
curl -X POST http://localhost:5000/api/vendas \
  -H "Authorization: Bearer SEU_TOKEN" -H "Content-Type: application/json" \
  -d '{"itens":[{"produtoId":"ID_DO_PRODUTO","quantidade":2}]}'
```

### GraphQL
Acesse `http://localhost:5000/graphql` no navegador (Apollo Sandbox) ou envie um POST:
```graphql
query {
  produtos { id nome quantidadeEstoque statusEstoque }
}
```

## 6. Estrutura do projeto

```
config/db.js            → conexão com MongoDB
models/                 → schemas Mongoose (Administrador, Categoria, Produto, Venda, ItemVenda, Movimentacao)
middleware/              → autenticação JWT (REST) e tratamento de erros
utils/gerarToken.js      → geração do JWT
services/vendaService.js → regra de negócio central: registrar venda + baixa automática (usada pelo REST e pelo GraphQL)
controllers/             → lógica das rotas REST
routes/                  → definição das rotas REST (Express Router)
graphql/                 → typeDefs (schema) e resolvers do Apollo Server
scripts/seedAdmin.js     → cria o primeiro administrador
server.js                → junta tudo: Express + REST + Apollo Server (GraphQL) + JWT
```

## 7. Observação sobre transações

O registro de venda usa uma **transação do MongoDB** (`mongoose.startSession()`) para garantir
que a venda, os itens, a baixa de estoque e a movimentação sejam gravados juntos — se algo falhar
no meio do caminho (ex: estoque insuficiente de um dos produtos), nada é salvo. Transações no
MongoDB exigem que o banco rode como Replica Set (item 1 acima).
