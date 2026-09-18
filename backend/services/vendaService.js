const mongoose = require('mongoose');
const Produto = require('../models/Produto');
const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const registrarVenda = async (itens, administradorId) => {
  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    throw new Error('A venda deve conter pelo menos um produto.');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let valorTotal = 0;
    const itensProcessados = [];

    // 1º passo: validar TODOS os itens antes de gravar qualquer coisa no banco
    for (const item of itens) {
      const { produtoId, quantidade } = item;

      if (!produtoId || !quantidade || quantidade <= 0) {
        throw new Error('Cada item precisa de produtoId e quantidade maior que zero.');
      }

      const produto = await Produto.findById(produtoId).session(session);

      if (!produto || produto.status !== 'ativo') {
        throw new Error(`Produto ${produtoId} não encontrado ou inativo.`);
      }

      if (produto.quantidadeEstoque < quantidade) {
        throw new Error(
          `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeEstoque}.`
        );
      }

      const subtotal = produto.preco * quantidade;
      valorTotal += subtotal;

      itensProcessados.push({
        produto,
        quantidade,
        precoUnitario: produto.preco,
        subtotal,
        estoquePosterior: produto.quantidadeEstoque - quantidade,
      });
    }
    const [venda] = await Venda.create([{ valorTotal, administrador: administradorId }], {
      session,
    });
    for (const item of itensProcessados) {
      await ItemVenda.create(
        [
          {
            venda: venda._id,
            produto: item.produto._id,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
            subtotal: item.subtotal,
          },
        ],
        { session }
      );

      item.produto.quantidadeEstoque = item.estoquePosterior;
      await item.produto.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return venda;
  } catch (erro) {
    await session.abortTransaction();
    session.endSession();
    throw erro; 
  }
};

module.exports = { registrarVenda };
