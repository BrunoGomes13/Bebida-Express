# BebidaExpress · Front-end

Front-end do painel administrativo da **BebidaExpress**, conectado ao backend real
(Node/Express + MongoDB, com **GraphQL** e **REST** expostos no mesmo servidor).
Construído com Create React App e **CSS puro**, seguindo a mesma estrutura de pastas
usada no projeto Nova Jornada Animal: cada componente/página em sua própria pasta,
com um par `Nome.js` + `Nome.css`.

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
    │   └── api.js                # cliente único: fala com GraphQL e com REST
    ├── routes/
    │   ├── AppRoutes.js
    │   └── RotaProtegida.js      # valida o token via REST (/auth/me)
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

## GraphQL principal, REST de complemento

O schema GraphQL do backend não cobre 100% das operações (não tem `atualizar`
nem `inativar` produto/categoria, não tem consulta de perfil, e o tipo `Venda`
não expõe os itens vendidos). Por isso `services/api.js` usa **GraphQL sempre
que o schema permite**, e cai para **REST** só onde é a única opção:

| Ação | Via | Motivo |
|---|---|---|
| Login | GraphQL (`mutation login`) | suportado |
| Validar token ao carregar a página | **REST** (`GET /auth/me`) | GraphQL não tem consulta de perfil |
| Listar produtos (ativos, com busca/categoria) | GraphQL (`query produtos`) + filtro no front | GraphQL não aceita argumentos de filtro |
| Listar produtos inativos / todos | **REST** (`GET /produtos?status=`) | `query produtos` só devolve ativos |
| Criar produto / categoria | GraphQL (`mutation criarProduto/criarCategoria`) | suportado |
| Editar produto / categoria | **REST** (`PUT`) | não existe mutation de atualização |
| Inativar produto / categoria | **REST** (`DELETE`) | não existe mutation de inativação |
| Listar estoque | GraphQL (`query estoque`) | suportado |
| Listar vendas / registrar venda | GraphQL (`query vendas` / `mutation registrarVenda`) | suportado |
| Ver itens de uma venda | **REST** (`GET /vendas/:id`) | tipo `Venda` do GraphQL não tem `itens` |

Cada modal mostra um selo (**via GraphQL** / **via REST**) indicando qual via foi
usada naquela ação, só para deixar isso visível durante o desenvolvimento.

## Como rodar (front + backend)

### 1. Backend

```bash
cd Bebida-Express-main
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
```

## Observações

- Ícones via [lucide-react](https://lucide.dev/). Navegação via
  [react-router-dom](https://reactrouter.com/).
- `services/api.js` normaliza toda resposta (do GraphQL ou do REST) para sempre
  expor a chave `id`, já que o GraphQL usa `id` e o Mongoose usa `_id`.
- Nomes de variáveis, funções, componentes e páginas estão em português,
  seguindo o mesmo padrão do projeto Nova Jornada Animal.
