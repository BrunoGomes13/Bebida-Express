import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import "./ModalNovaVenda.css";

// Regras da promoção — precisam bater com backend/services/vendaService.js
const VALOR_MINIMO_DESCONTO = 600;
const PERCENTUAL_DESCONTO = 0.1; // 10%

function linhaVazia() {
  return { produtoId: "", quantidade: 1 };
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Máscara automática: vai formatando "000.000.000-00" enquanto digita.
function formatarCpfDigitado(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Validação de CPF: só checa o formato (11 dígitos, não repetidos) — mesma
// regra do backend, sem exigir dígito verificador real.
function cpfValido(cpf) {
  const numeros = (cpf || "").replace(/\D/g, "");
  return numeros.length === 11 && !/^(\d)\1{10}$/.test(numeros);
}

function ModalNovaVenda({ produtos, enviando, erroEnvio, aoFechar, aoConfirmar }) {
  const [itens, definirItens] = useState([linhaVazia()]);
  const [nomeComprador, definirNomeComprador] = useState("");
  const [cpfComprador, definirCpfComprador] = useState("");
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

  function aoDigitarCpf(e) {
    definirCpfComprador(formatarCpfDigitado(e.target.value));
  }

  const valorBruto = itens.reduce((soma, item) => {
    const produto = produtoDaLinha(item.produtoId);
    const quantidade = Number(item.quantidade) || 0;
    return soma + (produto ? produto.preco * quantidade : 0);
  }, 0);

  const elegivelAoDesconto = valorBruto >= VALOR_MINIMO_DESCONTO;
  const valorComDesconto = valorBruto * (1 - PERCENTUAL_DESCONTO);
  const cpfPreenchidoEValido = elegivelAoDesconto && cpfValido(cpfComprador);
  const totalFinal = cpfPreenchidoEValido ? valorComDesconto : valorBruto;

  function aoEnviar(e) {
    e.preventDefault();
    definirErroLocal("");

    if (!nomeComprador.trim()) {
      definirErroLocal("Informe o nome do comprador.");
      return;
    }

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

    if (elegivelAoDesconto && cpfComprador.trim() && !cpfValido(cpfComprador)) {
      definirErroLocal("CPF do comprador inválido. Informe os 11 dígitos.");
      return;
    }

    aoConfirmar({
      itens: itensValidos.map((item) => ({ produtoId: item.produtoId, quantidade: Number(item.quantidade) })),
      nomeComprador: nomeComprador.trim(),
      cpfComprador: cpfComprador.trim() ? cpfComprador.trim() : undefined,
    });
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

          <div className="grade-campos grade-campos--2">
            <div className="campo">
              <label className="campo__rotulo">
                Nome do Comprador <span className="campo__obrigatorio">*</span>
              </label>
              <input
                value={nomeComprador}
                onChange={(e) => definirNomeComprador(e.target.value)}
                className="entrada"
                placeholder="Ex: Maria Silva"
              />
            </div>

            {elegivelAoDesconto && (
              <div className="campo">
                <label className="campo__rotulo">CPF do Comprador (opcional)</label>
                <input
                  value={cpfComprador}
                  onChange={aoDigitarCpf}
                  className="entrada"
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
              </div>
            )}
          </div>

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

          {elegivelAoDesconto ? (
            <div className="comparativo-desconto">
              <div className={`comparativo-desconto__opcao ${!cpfPreenchidoEValido ? "comparativo-desconto__opcao--ativa" : ""}`}>
                <span className="comparativo-desconto__rotulo">Sem CPF</span>
                <span className="comparativo-desconto__valor">{formatarMoeda(valorBruto)}</span>
              </div>
              <div className={`comparativo-desconto__opcao comparativo-desconto__opcao--desconto ${cpfPreenchidoEValido ? "comparativo-desconto__opcao--ativa" : ""}`}>
                <span className="comparativo-desconto__rotulo">Com CPF (10% off)</span>
                <span className="comparativo-desconto__valor">{formatarMoeda(valorComDesconto)}</span>
              </div>
            </div>
          ) : null}

          <div className="resumo-venda">
            <span>Total da venda</span>
            <span>{formatarMoeda(totalFinal)}</span>
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
