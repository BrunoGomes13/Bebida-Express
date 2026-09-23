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
    imagem: String
  }

  type EstoqueItem {
    produto: Produto!
    quantidade: Int!
    status: String!
  }

  type Administrador {
    id: ID!
    nome: String!
    email: String!
    status: String!
  }

  type ItemVenda {
    id: ID!
    produto: Produto
    quantidade: Int!
    precoUnitario: Float!
    subtotal: Float!
  }

  type Venda {
    id: ID!
    data: String!
    nomeComprador: String
    cpfComprador: String
    valorBruto: Float
    desconto: Float
    valorTotal: Float!
    administrador: Administrador
    itens: [ItemVenda!]!
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

  input ProdutoUpdateInput {
    codigo: String
    nome: String
    descricao: String
    categoria: ID
    preco: Float
    quantidadeEstoque: Int
    estoqueMinimo: Int
    imagem: String
    status: String
  }

  input CategoriaInput {
    nome: String!
    descricao: String
  }

  input CategoriaUpdateInput {
    nome: String
    descricao: String
    status: String
  }


  type AuthPayload{
  token: String!
  id: ID!
  nome: String!
  email: String!
  }

  type Query {
    produtos(categoria: ID, status: String, busca: String): [Produto!]!
    produto(id: ID!): Produto
    categorias: [Categoria!]!
    estoque: [EstoqueItem!]!
    vendas: [Venda!]!
    venda(id: ID!): Venda
    meuPerfil: Administrador
  }

  type Mutation {
    registrarVenda(itens: [ItemVendaInput!]!, nomeComprador: String!, cpfComprador: String): Venda!
    criarProduto(dados: ProdutoInput!): Produto!
    atualizarProduto(id: ID!, dados: ProdutoUpdateInput!): Produto!
    inativarProduto(id: ID!): Produto!
    criarCategoria(dados: CategoriaInput!): Categoria!
    atualizarCategoria(id: ID!, dados: CategoriaUpdateInput!): Categoria!
    inativarCategoria(id: ID!): Categoria!
    login(email: String!, senha: String!): AuthPayload!
  }
`;

module.exports = typeDefs;
