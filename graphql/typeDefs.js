// Define o "schema" GraphQL: quais tipos, consultas (Query) e
// alterações (Mutation) o Apollo Server vai expor.
const typeDefs = `#graphql
  type Categoria {
    id: ID!
    nome: String!
    descricao: String
    status: String!
  }

  type Produto {
    id: ID!
    codigo: String!
    nome: String!
    descricao: String
    categoria: Categoria
    preco: Float!
    quantidadeEstoque: Int!
    estoqueMinimo: Int!
    statusEstoque: String!
    status: String!
  }

  type EstoqueItem {
    produto: Produto!
    quantidade: Int!
    status: String!
  }

  type Venda {
    id: ID!
    data: String!
    valorTotal: Float!
  }

  input ItemVendaInput {
    produtoId: ID!
    quantidade: Int!
  }

  type Query {
    produtos: [Produto!]!
    produto(id: ID!): Produto
    categorias: [Categoria!]!
    estoque: [EstoqueItem!]!
    vendas: [Venda!]!
    venda(id: ID!): Venda
  }

  type Mutation {
    registrarVenda(itens: [ItemVendaInput!]!): Venda!
  }
`;

module.exports = typeDefs;
