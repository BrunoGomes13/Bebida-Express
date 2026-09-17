import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import "./ModalNovaVenda.css";

function linhaVazia() {
  return { produtoId: "", quantidade: 1 };
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ModalNovaVenda({ produtos, enviando, erroEnvio, aoFechar, aoConfirmar }) {
  const [itens, definirItens] = useState([linhaVazia()]);
  const [erroLocal, definirErroLocal] = useState("");

  function atualizarLinha(indice, campo, valor) {
    definirItens((anteriores) => anteriores.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)));
  }

  function adicionarLinha() {
    definirItens((anteriores) => [...anteriores, linhaVazia()]);
  }

  function removerLinha(indice) {
    definirItens((anteriores) => anteriores.filter((_, i) => i !== indice));
  }

  function produtoDaLinha(produtoId) {
    return produtos.find((p) => p.id === produtoId);
  }

  const total = itens.reduce((soma, item) => {
    const produto = produtoDaLinha(item.produtoId);
    const quantidade = Number(item.quantidade) || 0;
    return soma + (produto ? produto.preco * quantidade : 0);
  }, 0);

  function aoEnviar(e) {
    e.preventDefault();
    definirErroLocal("");

    const itensValidos = itens.filter((item) => item.produtoId && Number(item.quantidade) > 0);

    if (itensValidos.length === 0) {
      definirErroLocal("Adicione pelo menos um produto com quantidade maior que zero.");
      return;
    }

    for (const item of itensValidos) {
      const produto = produtoDaLinha(item.produtoId);
      if (produto && Number(item.quantidade) > produto.quantidadeEstoque) {
        definirErroLocal(`Estoque insuficiente para "${produto.nome}". Disponível: ${produto.quantidadeEstoque}.`);
        return;
      }
    }

    aoConfirmar(itensValidos.map((item) => ({ produtoId: item.produtoId, quantidade: Number(item.quantidade) })));
  }

  return (
    <div className="sobreposicao-modal">
      <div className="modal modal--largo">
        <div className="modal__cabecalho">
          <h2 className="modal__titulo">Nova Venda</h2>
          <button onClick={aoFechar} className="modal__fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={aoEnviar} className="modal__corpo">
          {(erroEnvio || erroLocal) && <div className="mensagem-erro">{erroEnvio || erroLocal}</div>}

          {itens.map((item, indice) => {
            const produto = produtoDaLinha(item.produtoId);
            const subtotal = produto ? produto.preco * (Number(item.quantidade) || 0) : 0;
            return (
              <div key={indice} className="linha-item-venda">
                <div className="linha-item-venda__produto">
                  <select
                    value={item.produtoId}
                    onChange={(e) => atualizarLinha(indice, "produtoId", e.target.value)}
                    className="selecao"
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantidadeEstoque <= 0}>
                        {p.nome} {p.quantidadeEstoque <= 0 ? "(esgotado)" : `— estoque: ${p.quantidadeEstoque}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="linha-item-venda__quantidade">
                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => atualizarLinha(indice, "quantidade", e.target.value)}
                    className="entrada"
                  />
                </div>

                <p className="linha-item-venda__subtotal">{formatarMoeda(subtotal)}</p>

                <button
                  type="button"
                  onClick={() => removerLinha(indice)}
                  className="botao-icone"
                  disabled={itens.length === 1}
                  title="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <button type="button" onClick={adicionarLinha} className="botao botao--secundario botao--pequeno">
            <Plus size={14} /> Adicionar item
          </button>

          <div className="resumo-venda">
            <span>Total da venda</span>
            <span>{formatarMoeda(total)}</span>
          </div>

          <div className="modal__rodape">
            <button type="button" onClick={aoFechar} className="botao botao--secundario botao--bloco" disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
              {enviando ? "Registrando..." : "Registrar Venda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalNovaVenda;
