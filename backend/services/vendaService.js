const mongoose = require('mongoose');
const Produto = require('../models/Produto');
const Venda = require('../models/Venda');
const ItemVenda = require('../models/ItemVenda');
const validarCpf = require('../utils/validarCpf');

// Regra da promoção: compras acima desse valor ganham o desconto, desde
// que o comprador informe o CPF.
const VALOR_MINIMO_DESCONTO = 600;
const PERCENTUAL_DESCONTO = 0.1; // 10%

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
 *
 * Regra do desconto: se o valor bruto da venda for maior ou igual a
 * R$ 600,00 e o comprador informar o CPF (válido), aplica 10% de desconto
 * automaticamente. Sem CPF, mesmo acima de R$ 600,00, a venda segue pelo
 * valor cheio.
 */
const registrarVenda = async (dadosVenda, administradorId) => {
  const { itens, nomeComprador, cpfComprador } = dadosVenda;

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    throw new Error('A venda deve conter pelo menos um produto.');
  }

  if (!nomeComprador || !nomeComprador.trim()) {
    throw new Error('Informe o nome do comprador.');
  }

  if (cpfComprador && !validarCpf(cpfComprador)) {
    throw new Error('CPF do comprador inválido.');
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let valorBruto = 0;
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
      valorBruto += subtotal;

      itensProcessados.push({
        produto,
        quantidade,
        precoUnitario: produto.preco,
        subtotal,
        estoquePosterior: produto.quantidadeEstoque - quantidade,
      });
    }

    // 2º passo: calcular o desconto (10% acima de R$ 600, só com CPF informado)
    const temDireitoAoDesconto = valorBruto >= VALOR_MINIMO_DESCONTO && !!cpfComprador;
    const desconto = temDireitoAoDesconto ? valorBruto * PERCENTUAL_DESCONTO : 0;
    const valorTotal = valorBruto - desconto;

    // 3º passo: criar o cabeçalho da Venda
    const [venda] = await Venda.create(
      [
        {
          nomeComprador: nomeComprador.trim(),
          cpfComprador: cpfComprador ? cpfComprador.replace(/\D/g, '') : undefined,
          valorBruto,
          desconto,
          valorTotal,
          administrador: administradorId,
        },
      ],
      { session }
    );

    // 4º passo: para cada item -> gravar ItemVenda e dar baixa no Produto
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
    throw erro; // quem chamou (controller ou resolver) decide como responder
  }
};

module.exports = { registrarVenda };
