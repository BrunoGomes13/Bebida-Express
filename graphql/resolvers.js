const Produto = require('../models/Produto');
const Categoria = require('../models/Categoria');
const Venda = require('../models/Venda');
const vendaService = require('../services/vendaService');

const resolvers = {
 Query: {
  produtos: async (_, __, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    return Produto.find({ status: 'ativo' }).populate('categoria');
  },

  produto: async (_, { id }, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    return Produto.findById(id).populate('categoria');
  },

  categorias: async (_, __, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    return Categoria.find();
  },

  estoque: async (_, __, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    const produtos = await Produto.find({ status: 'ativo' });

    return produtos.map((produto) => ({
      produto,
      quantidade: produto.quantidadeEstoque,
      status: produto.statusEstoque,
    }));
  },

  vendas: async (_, __, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    return Venda.find().sort({ data: -1 });
  },

  venda: async (_, { id }, contexto) => {
    if (!contexto.administrador) {
      throw new Error('Não autorizado. Faça login para consultar.');
    }

    return Venda.findById(id);
  },
},

  Mutation: {
    // contexto.administrador vem do server.js, extraído do token JWT
    registrarVenda: async (_, { itens }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para registrar uma venda.');
      }

      const itensFormatados = itens.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
      }));

      return vendaService.registrarVenda(itensFormatados, contexto.administrador._id);
    },
  },

  // Resolvers de campo: convertem _id (ObjectId) em id (String) exigido pelo schema
  Produto: {
    id: (produto) => produto._id.toString(),
  },
  Categoria: {
    id: (categoria) => categoria._id.toString(),
  },
  Venda: {
    id: (venda) => venda._id.toString(),
    data: (venda) => venda.data.toISOString(),
  },
};

module.exports = resolvers;
