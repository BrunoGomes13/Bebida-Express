import { X } from "lucide-react";
import "./ModalDetalheVenda.css";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

function ModalDetalheVenda({ venda, itens, carregando, erro, aoFechar }) {
  return (
    <div className="sobreposicao-modal">
      <div className="modal">
        <div className="modal__cabecalho">
          <h2 className="modal__titulo">Detalhes da Venda</h2>
          <button onClick={aoFechar} className="modal__fechar">
            <X size={20} />
          </button>
        </div>

        <div className="modal__corpo">
          {erro && <div className="mensagem-erro">{erro}</div>}

          {carregando ? (
            <div className="estado-carregando">Carregando itens da venda...</div>
          ) : (
            venda && (
              <>
                <div className="venda-detalhe__linha">
                  <span>Data</span>
                  <span>{formatarData(venda.data)}</span>
                </div>
                <div className="venda-detalhe__linha">
                  <span>Registrada por</span>
                  <span>{venda.administrador?.nome || "—"}</span>
                </div>

                <div style={{ marginTop: "0.5rem" }}>
                  {itens.map((item) => (
                    <div key={item._id} className="venda-detalhe__linha">
                      <span>
                        {item.quantidade}x {item.produto?.nome || "Produto removido"}
                      </span>
                      <span>{formatarMoeda(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="resumo-venda">
                  <span>Total</span>
                  <span>{formatarMoeda(venda.valorTotal)}</span>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalDetalheVenda;
