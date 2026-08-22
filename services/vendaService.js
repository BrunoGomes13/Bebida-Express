const mongoose = require('mongoose');
const Produto = require('../models/Produto');
const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const Movimentacao = require('../models/Movimentacao');

/**
 * Função central do sistema: registra uma venda e dá baixa automática no estoque.
 * Usada tanto pela rota REST (POST /api/vendas) quanto pela mutation GraphQL
 * (registrarVenda), garantindo que a regra de negócio exista em um único lugar.
 *
 * Usa uma transação do MongoDB (session) para garantir que TUDO aconteça
 * junto: se qualquer produto tiver estoque insuficiente, nada é gravado
 * (nem a venda, nem os itens, nem a baixa de estoque).
 *
 * Observação: transações exigem que o MongoDB rode como Replica Set
 * (MongoDB Atlas já vem assim por padrão; localmente é preciso configurar
 * um replica set de um único nó — veja o README).
 */
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
        estoqueAnterior: produto.quantidadeEstoque,
        estoquePosterior: produto.quantidadeEstoque - quantidade,
      });
    }

    // 2º passo: criar o cabeçalho da Venda
    const [venda] = await Venda.create([{ valorTotal, administrador: administradorId }], {
      session,
    });

    // 3º passo: para cada item -> gravar ItemVenda, dar baixa no Produto,
    // e registrar a Movimentação (histórico do "porquê" o estoque mudou)
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

      await Movimentacao.create(
        [
          {
            produto: item.produto._id,
            venda: venda._id,
            tipo: 'saida',
            quantidade: item.quantidade,
            estoqueAnterior: item.estoqueAnterior,
            estoquePosterior: item.estoquePosterior,
            administrador: administradorId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return venda;
  } catch (erro) {
    await session.abortTransaction();
    session.endSession();
    throw erro; // quem chamou (controller ou resolver) decide como responder
  }
};

module.exports = { registrarVenda };
