# 🥤 Bebida Express

Sistema web de controle de estoque e registro de vendas para estabelecimentos
que comercializam bebidas. Uso exclusivamente administrativo — não existe área
pública ou cadastro de clientes.

## 👥 Integrantes do Grupo

- Alan Bezerra Chagas
- Bruno Gomes de Albuquerque Costa
- Daniel Tavares de Almeida
- Ivys Oliveira Dantas

## 📋 Descrição da Aplicação

O **Bebida Express** nasceu para resolver um problema comum em estabelecimentos
que vendem bebidas: o controle de estoque feito manualmente (planilhas,
anotações), que gera erros de contagem, estoque desatualizado e risco de
vender produtos sem quantidade suficiente.

O sistema permite que o administrador:

- Cadastre **produtos** e **categorias**, controlando preço, quantidade em
  estoque e estoque mínimo.
- Registre **vendas** selecionando vários produtos e quantidades de uma vez.
- Receba a **baixa automática no estoque** assim que a venda é confirmada —
  sem precisar atualizar manualmente.
- Consulte o **histórico de vendas**, com o detalhe dos itens de cada uma.
- Identifique produtos com **estoque baixo** ou **esgotado**.

A regra central do sistema: toda vez que uma venda é registrada, os produtos
vendidos têm suas quantidades automaticamente descontadas do estoque, dentro
de uma **transação** — se um dos produtos não tiver estoque suficiente, nada
é gravado.

## 🏗️ Arquitetura

Projeto dividido em duas pastas independentes:

```
Bebida-Express/
├── backend/     # API Node.js/Express — REST + GraphQL, MongoDB, JWT
└── front/       # Painel administrativo em React, consome o backend
```

| Parte | Stack | Documentação |
|---|---|---|
| **Backend** | Node.js, Express, Apollo Server (GraphQL), MongoDB Atlas, JWT | [`backend/README.md`](./backend/README.md) |
| **Front-end** | React (Create React App), react-router-dom, CSS puro | [`front/README.md`](./front/README.md) |

O front usa **GraphQL como via principal** para todas as operações (login,
listagens, criação, edição, inativação, registro de venda) e cai para a API
REST automaticamente só se alguma chamada GraphQL falhar — os detalhes de
qual endpoint atende cada ação estão documentados em cada README.

## ▶️ Como rodar o projeto completo

**1.** Suba o backend primeiro (veja [`backend/README.md`](./backend/README.md)
para as variáveis de ambiente e o `npm run seed:admin`):
```bash
cd backend
npm install
npm run dev      # REST em :5000/api, GraphQL em :5000/graphql
```

**2.** Em outro terminal, suba o front (veja
[`front/README.md`](./front/README.md) para detalhes):
```bash
cd front
npm install
npm start         # http://localhost:3000
```

**3.** Acesse `http://localhost:3000` e faça login com o e-mail/senha
definidos no `.env` do backend (`ADMIN_EMAIL` / `ADMIN_SENHA`).

## 🔑 Acesso ao sistema

Após rodar `npm run seed:admin` no backend, as credenciais padrão (a menos
que tenham sido alteradas no `.env`) são:

```
E-mail: admin@bebidaexpress.com
Senha:  admin123
```
