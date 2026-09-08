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

  input ProdutoInput {
  codigo: String!
  nome: String!
  descricao: String
  categoria: ID!
  preco: Float!
  quantidadeEstoque: Int
  estoqueMinimo: Int
  imagem: String
  }

  type AuthPayload{
  token: String!
  id: ID!
  nome: String!
  email: String!
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
    criarProduto(dados: ProdutoInput!): Produto!
    login(email: String!, senha: String!): AuthPayload!
  }
`;

module.exports = typeDefs;
