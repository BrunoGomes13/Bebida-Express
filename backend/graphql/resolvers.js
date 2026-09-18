const Produto = require('../models/Produto');
const Categoria = require('../models/Categoria');
const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const Administrador = require('../models/Administrador');
const vendaService = require('../services/vendaService');
const gerarToken = require('../utils/gerarToken');

const resolvers = {
  Query: {
    produtos: async (_, { categoria, status, busca }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para consultar.');
      }

      const filtro = {};
      if (categoria) filtro.categoria = categoria;
      filtro.status = status || 'ativo';
      if (busca) filtro.nome = { $regex: busca, $options: 'i' };

      return Produto.find(filtro).populate('categoria').sort({ nome: 1 });
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

      const produtos = await Produto.find({ status: 'ativo' }).populate('categoria');

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

    meuPerfil: async (_, __, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para consultar.');
      }

      return contexto.administrador;
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

    atualizarProduto: async (_, { id, dados }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para editar um produto.');
      }

      const produto = await Produto.findByIdAndUpdate(id, dados, {
        new: true,
        runValidators: true,
      }).populate('categoria');

      if (!produto) throw new Error('Produto não encontrado.');
      return produto;
    },

    inativarProduto: async (_, { id }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para inativar um produto.');
      }

      const produto = await Produto.findByIdAndUpdate(
        id,
        { status: 'inativo' },
        { new: true }
      ).populate('categoria');

      if (!produto) throw new Error('Produto não encontrado.');
      return produto;
    },

    criarCategoria: async (_, { dados }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para cadastrar uma categoria.');
      }

      return Categoria.create({
        nome: dados.nome,
        descricao: dados.descricao,
      });
    },

    atualizarCategoria: async (_, { id, dados }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para editar uma categoria.');
      }

      const categoria = await Categoria.findByIdAndUpdate(id, dados, {
        new: true,
        runValidators: true,
      });

      if (!categoria) throw new Error('Categoria não encontrada.');
      return categoria;
    },

    inativarCategoria: async (_, { id }, contexto) => {
      if (!contexto.administrador) {
        throw new Error('Não autorizado. Faça login para inativar uma categoria.');
      }

      const categoria = await Categoria.findByIdAndUpdate(
        id,
        { status: 'inativo' },
        { new: true }
      );

      if (!categoria) throw new Error('Categoria não encontrada.');
      return categoria;
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
  Administrador: {
    id: (administrador) => administrador._id.toString(),
  },
  ItemVenda: {
    id: (item) => item._id.toString(),
  },
  Venda: {
    id: (venda) => venda._id.toString(),
    data: (venda) => venda.data.toISOString(),
    administrador: (venda) => Administrador.findById(venda.administrador),
    itens: (venda) => ItemVenda.find({ venda: venda._id }).populate('produto'),
  },
};

module.exports = resolvers;
