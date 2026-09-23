# BebidaExpress · Front-end

Front-end do painel administrativo da **BebidaExpress**, conectado ao backend
real (Node/Express + MongoDB). Construído com Create React App e **CSS puro**.

## Estrutura

```
front/
├── public/
│   ├── index.html
│   └── manifest.json
├── package.json
├── .env.example
└── src/
    ├── index.js
    ├── index.css                # reset + variáveis + classes compartilhadas
    ├── App.js
    ├── assets/
    │   └── logo.svg
    ├── data/
    │   └── constantes.js         # rótulos/selos de status de estoque
    ├── services/
    │   └── api.js                # cliente único: GraphQL + REST de reforço
    ├── routes/
    │   ├── AppRoutes.js
    │   └── RotaProtegida.js      # valida o token (via GraphQL, com fallback REST)
    ├── components/
    │   ├── Login/
    │   ├── Layout/               # LayoutPainel: barra lateral + conteúdo
    │   ├── BarraLateral/
    │   ├── Cabecalho/            # barra superior no mobile
    │   ├── CartaoEstatistica/
    │   ├── Notificacao/          # toast de sucesso/erro
    │   ├── ModalConfirmacao/
    │   ├── ModalProduto/
    │   ├── ModalCategoria/
    │   ├── ModalNovaVenda/
    │   └── ModalDetalheVenda/
    └── pages/
        ├── Produtos/
        ├── Categorias/
        ├── Estoque/
        └── Vendas/
```

## GraphQL como via principal

**Toda** operação do front — login, listar/criar/editar/inativar produtos e
categorias, listar estoque, listar/registrar vendas e ver os itens de uma
venda — passa primeiro pelo GraphQL (`/graphql`). A API REST (`/api`) só entra
como **rede de segurança**: se a chamada GraphQL falhar (rede instável, schema
desatualizado no servidor, erro pontual), a função correspondente em
`services/api.js` cai automaticamente para o endpoint REST equivalente,
sem o usuário perceber.

## Como rodar (front + backend)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # preencha MONGO_URI, JWT_SECRET etc.
npm run seed:admin       # cria o administrador inicial
npm run dev               # REST em :5000/api, GraphQL em :5000/graphql
```

### 2. Front-end

```bash
cd front
npm install
cp .env.example .env
npm start                 # http://localhost:3000
```

Faça login com o e-mail/senha do `.env` do backend (`ADMIN_EMAIL` / `ADMIN_SENHA`).

## Build de produção

```bash
npm run build
