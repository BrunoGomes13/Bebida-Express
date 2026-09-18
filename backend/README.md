# 🥤 Bebida Express — Backend

API do sistema de controle de estoque e registro de vendas da Bebida Express,
com **REST** e **GraphQL** expostos no mesmo servidor. Uso exclusivamente
administrativo — não existe área pública ou cadastro de clientes.

## 🛠️ Tecnologias

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

## 📁 Estrutura

```
backend/
├── config/
│   └── db.js                     # Conexão com MongoDB Atlas
├── controllers/
│   ├── authController.js         # Login e perfil do administrador
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
│   ├── Produto.js                  # Schema de Produto (com status de estoque calculado)
│   ├── Venda.js                    # Schema de Venda
│   ├── ItemVenda.js                # Schema dos itens de cada venda
│   └── Movimentacao.js             # Registro interno de cada entrada/saída de estoque
├── routes/
│   ├── authRoutes.js               # Rotas /api/auth
│   ├── categoriaRoutes.js          # Rotas /api/categorias
│   ├── produtoRoutes.js            # Rotas /api/produtos
│   ├── estoqueRoutes.js            # Rotas /api/estoque
│   └── vendaRoutes.js              # Rotas /api/vendas
├── scripts/
│   └── seedAdmin.js                # Cria o administrador inicial
├── services/
│   └── vendaService.js             # Regra de negócio central: venda + baixa automática (transação)
├── utils/
│   └── gerarToken.js               # Geração do token JWT
├── .env.example
├── server.js                       # Inicialização do Express + Apollo Server (GraphQL)
└── package.json
```

## 🔌 Endpoints REST

Base: `http://localhost:5000/api`. Todas as rotas abaixo exigem
`Authorization: Bearer <token>`, exceto o login.

### Autenticação — `/auth`

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/login | 🔓 Login do administrador, retorna o JWT |
| GET | /auth/me | Retorna os dados do administrador do token enviado |

### Categorias — `/categorias`

| Método | Rota | Descrição |
|---|---|---|
| POST | /categorias | Cadastra uma categoria |
| GET | /categorias | Lista todas as categorias |
| GET | /categorias/:id | Busca uma categoria por ID |
| PUT | /categorias/:id | Atualiza uma categoria |
| DELETE | /categorias/:id | Inativa uma categoria (não exclui fisicamente) |

### Produtos — `/produtos`

| Método | Rota | Descrição |
|---|---|---|
| POST | /produtos | Cadastra um produto |
| GET | /produtos | Lista produtos (filtros: `?categoria=&status=&busca=`) |
| GET | /produtos/:id | Busca um produto por ID |
| PUT | /produtos/:id | Atualiza um produto |
| DELETE | /produtos/:id | Inativa um produto (não exclui fisicamente) |

### Estoque — `/estoque`

| Método | Rota | Descrição |
|---|---|---|
| GET | /estoque | Lista o estoque dos produtos ativos, com `statusEstoque`: `normal` \| `estoque_baixo` \| `esgotado` |
| GET | /estoque/:produtoId | Consulta o estoque de um produto específico |

### Vendas — `/vendas`

| Método | Rota | Descrição |
|---|---|---|
| POST | /vendas | Registra uma venda com baixa automática de estoque |
| GET | /vendas | Lista o histórico de vendas |
| GET | /vendas/:id | Detalha uma venda e seus itens |

## 🔮 GraphQL — `/graphql`

GraphQL é a via **principal** usada pelo front — cobre praticamente tudo que a
API REST cobre, incluindo edição e inativação. Exige `Authorization: Bearer
<token>` no header em todas as operações abaixo (exceto `login`).

| Tipo | Operação | Descrição |
|---|---|---|
| Query | `produtos(categoria, status, busca)` | Lista produtos com os mesmos filtros da rota REST |
| Query | `produto(id)` | Busca um produto por ID |
| Query | `categorias` | Lista categorias |
| Query | `estoque` | Lista o estoque com `statusEstoque` |
| Query | `vendas` | Lista vendas |
| Query | `venda(id)` | Busca uma venda, com `administrador` e `itens` |
| Query | `meuPerfil` | Dados do administrador do token |
| Mutation | `login(email, senha)` | 🔓 Autentica e retorna o JWT |
| Mutation | `criarProduto(dados)` | Cadastra um produto |
| Mutation | `atualizarProduto(id, dados)` | Atualiza um produto |
| Mutation | `inativarProduto(id)` | Inativa um produto |
| Mutation | `criarCategoria(dados)` | Cadastra uma categoria |
| Mutation | `atualizarCategoria(id, dados)` | Atualiza uma categoria |
| Mutation | `inativarCategoria(id)` | Inativa uma categoria |
| Mutation | `registrarVenda(itens)` | Registra uma venda com baixa automática |

## 🗄️ Modelagem do Banco de Dados

MongoDB Atlas (NoSQL), gerenciado via Mongoose.

### Coleção `administradors`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| nome | String | ✅ | Nome do administrador |
| email | String | ✅ | E-mail único (lowercase) |
| senha | String | ✅ | Senha com hash bcrypt |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |

### Coleção `categorias`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| nome | String | ✅ | Nome da categoria (único) |
| descricao | String | ❌ | Descrição da categoria |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |

### Coleção `produtos`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| codigo | String | ✅ | Código único do produto |
| nome | String | ✅ | Nome do produto |
| descricao | String | ❌ | Descrição do produto |
| categoria | ObjectId (ref: Categoria) | ✅ | Categoria do produto |
| preco | Number | ✅ | Preço de venda |
| quantidadeEstoque | Number | ✅ | Quantidade disponível (padrão: 0) |
| estoqueMinimo | Number | ✅ | Limite configurável de aviso de estoque baixo (padrão: 5) |
| imagem | String | ❌ | URL da imagem do produto |
| status | String (enum) | ❌ | "ativo" \| "inativo" (padrão: "ativo") |
| statusEstoque | Virtual (calculado) | — | "normal" \| "estoque_baixo" \| "esgotado" — ver observação abaixo |

> **Como `statusEstoque` é calculado:** fica "esgotado" quando `quantidadeEstoque`
> chega a 0; fica "estoque_baixo" quando `quantidadeEstoque <= estoqueMinimo` **ou**
> quando restam poucas unidades (margem de segurança fixa de 2 unidades) — isso
> garante o aviso mesmo em produtos cadastrados com `estoqueMinimo: 0`.

### Coleção `vendas`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| data | Date | ❌ | Data da venda (padrão: agora) |
| valorTotal | Number | ✅ | Valor total calculado da venda |
| administrador | ObjectId (ref: Administrador) | ✅ | Quem registrou a venda |

### Coleção `itemvendas`

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| venda | ObjectId (ref: Venda) | ✅ | Venda à qual o item pertence |
| produto | ObjectId (ref: Produto) | ✅ | Produto vendido |
| quantidade | Number | ✅ | Quantidade vendida |
| precoUnitario | Number | ✅ | Preço unitário no momento da venda |
| subtotal | Number | ✅ | quantidade × precoUnitario |

### Coleção `movimentacaos`

Registro interno de auditoria: toda vez que uma venda é registrada, uma
movimentação de saída é gravada automaticamente por `services/vendaService.js`
para cada produto vendido — guarda o estoque antes/depois, a quantidade e quem
fez a venda.

> ⚠️ **Ainda não tem endpoint próprio.** Os registros são gravados, mas não
> existe hoje uma rota REST nem uma query GraphQL para listá-los — é só um
> histórico interno no banco por enquanto. Se quiser consultar essas
> movimentações pelo painel, é preciso criar essa rota/resolver (é simples:
> só um `Movimentacao.find().populate(...)`, no mesmo padrão dos outros
> controllers).

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| produto | ObjectId (ref: Produto) | ✅ | Produto que teve o estoque alterado |
| venda | ObjectId (ref: Venda) | ❌ | Venda que originou a movimentação |
| tipo | String (enum) | ✅ | "entrada" \| "saida" |
| quantidade | Number | ✅ | Quantidade movimentada |
| estoqueAnterior | Number | ✅ | Estoque antes da movimentação |
| estoquePosterior | Number | ✅ | Estoque depois da movimentação |
| administrador | ObjectId (ref: Administrador) | ✅ | Responsável pela movimentação |

## ▶️ Como rodar

### Pré-requisitos

- Node.js 18 ou superior
- Conta no MongoDB Atlas com cluster configurado como Replica Set (padrão do
  Atlas) — o registro de venda usa transações
- npm

### Passos

**1.** Instale as dependências:
```bash
cd backend
npm install
```

**2.** Crie o `.env` (baseado no `.env.example`):
```
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb_atlas
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@bebidaexpress.com
ADMIN_SENHA=admin123
```

**3.** No MongoDB Atlas, libere seu IP em **Network Access**.

**4.** Crie o administrador inicial (não existe cadastro público):
```bash
npm run seed:admin
```

**5.** Inicie o servidor:
```bash
npm run dev     # com reinício automático
# ou
npm start
```

O servidor sobe em:
- **REST**: http://localhost:5000/api
- **GraphQL**: http://localhost:5000/graphql (abre o Apollo Sandbox no navegador)

## 🔑 Testando o login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bebidaexpress.com","senha":"admin123"}'
```

O token JWT retornado vai no header `Authorization: Bearer <token>` em todas
as demais rotas privadas (REST e GraphQL).
