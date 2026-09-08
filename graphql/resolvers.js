const Produto = require('../models/Produto');
const Categoria = require('../models/Categoria');
const Venda = require('../models/Venda');
const vendaService = require('../services/vendaService');
const Administrador = require('../models/Administrador');
const gerarToken = require('../utils/gerarToken');

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

    criarProduto: async (_, { dados }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para cadastrar um produto.');
      }

      const produto = await Produto.create({
        codigo: dados.codigo,
        nome: dados.nome,
        descricao: dados.descricao,
        categoria: dados.categoria,
        preco: dados.preco,
        quantidadeEstoque: dados.quantidadeEstoque ?? 0,
        estoqueMinimo: dados.estoqueMinimo ?? 5,
        imagem: dados.imagem ?? '',
      });

      return produto.populate('categoria');
    },

    login: async (_, { email, senha }) => {
      const administrador = await Administrador.findOne({ email });

      if (!administrador || administrador.status !== 'ativo') {
        throw new Error('Credenciais inválidas.');
      }

      const senhaCorreta = await administrador.compararSenha(senha);

      if (!senhaCorreta) {
        throw new Error('Credenciais inválidas.');
      }

      return {
        id: administrador._id.toString(),
        nome: administrador.nome,
        email: administrador.email,
        token: gerarToken(administrador._id),
      };
    },
  },  



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
