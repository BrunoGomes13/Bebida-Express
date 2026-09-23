import { useEffect, useState } from "react";
import { Plus, Eye, X, CalendarDays, Percent } from "lucide-react";
import { buscarVendas, registrarVenda, obterVenda, buscarProdutos } from "../../services/api";
import Notificacao from "../../components/Notificacao/Notificacao";
import CartaoEstatistica from "../../components/CartaoEstatistica/CartaoEstatistica";
import ModalNovaVenda from "../../components/ModalNovaVenda/ModalNovaVenda";
import ModalDetalheVenda from "../../components/ModalDetalheVenda/ModalDetalheVenda";
import "./Vendas.css";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

function Vendas() {
  const [vendas, definirVendas] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState("");

  const [modalNovaVendaAberto, definirModalNovaVendaAberto] = useState(false);
  const [produtosParaVenda, definirProdutosParaVenda] = useState([]);
  const [carregandoProdutos, definirCarregandoProdutos] = useState(false);
  const [erroProdutos, definirErroProdutos] = useState("");
  const [registrando, definirRegistrando] = useState(false);
  const [erroRegistrar, definirErroRegistrar] = useState("");

  const [vendaSelecionadaId, definirVendaSelecionadaId] = useState(null);
  const [detalheVenda, definirDetalheVenda] = useState(null);
  const [carregandoDetalhe, definirCarregandoDetalhe] = useState(false);
  const [erroDetalhe, definirErroDetalhe] = useState("");

  const [aviso, definirAviso] = useState({ visivel: false, mensagem: "", tipo: "sucesso" });

  function mostrarAviso(mensagem, tipo = "sucesso") {
    definirAviso({ visivel: true, mensagem, tipo });
    setTimeout(() => fecharAviso(), 3000);
  }

  function fecharAviso() {
    definirAviso((anterior) => ({ ...anterior, visivel: false }));
  }

  async function carregarVendas() {
    definirCarregando(true);
    definirErro("");
    try {
      const dados = await buscarVendas();
      definirVendas(dados);
    } catch (erroBusca) {
      definirErro(erroBusca.message);
    } finally {
      definirCarregando(false);
    }
  }

  useEffect(() => {
    carregarVendas();
  }, []);

  async function abrirModalNovaVenda() {
    definirModalNovaVendaAberto(true);
    definirErroRegistrar("");
    definirCarregandoProdutos(true);
    definirErroProdutos("");
    try {
      const dados = await buscarProdutos({ status: "" });
      definirProdutosParaVenda(dados);
    } catch (erroBusca) {
      definirErroProdutos(erroBusca.message);
    } finally {
      definirCarregandoProdutos(false);
    }
  }

  async function confirmarNovaVenda(dadosVenda) {
    definirRegistrando(true);
    definirErroRegistrar("");
    try {
      await registrarVenda(dadosVenda);
      definirModalNovaVendaAberto(false);
      mostrarAviso("Venda registrada com sucesso.");
      await carregarVendas();
    } catch (erroRegistro) {
      definirErroRegistrar(erroRegistro.message);
    } finally {
      definirRegistrando(false);
    }
  }

  async function abrirDetalhe(venda) {
    definirVendaSelecionadaId(venda.id);
    definirDetalheVenda(null);
    definirErroDetalhe("");
    definirCarregandoDetalhe(true);
    try {
      const dados = await obterVenda(venda.id);
      definirDetalheVenda(dados);
    } catch (erroBusca) {
      definirErroDetalhe(erroBusca.message);
    } finally {
      definirCarregandoDetalhe(false);
    }
  }

  const agora = new Date();
  const vendasDoMes = vendas.filter((venda) => {
    const dataVenda = new Date(venda.data);
    return dataVenda.getMonth() === agora.getMonth() && dataVenda.getFullYear() === agora.getFullYear();
  });
  const totalVendidoNoMes = vendasDoMes.reduce((soma, venda) => soma + venda.valorTotal, 0);
  const totalDescontoNoMes = vendasDoMes.reduce((soma, venda) => soma + (venda.desconto || 0), 0);
  const nomeMesAtual = agora.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Gestão de Vendas</h1>
          <p className="cabecalho-pagina__subtitulo">{vendas.length} vendas registradas</p>
        </div>
        <button onClick={abrirModalNovaVenda} className="botao botao--primario">
          <Plus size={18} /> Nova Venda
        </button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="grade-estatisticas grade-estatisticas--2">
        <CartaoEstatistica
          icone={CalendarDays}
          corFundoIcone="#ecfdf5"
          corIcone="#10b981"
          valor={formatarMoeda(totalVendidoNoMes)}
          rotulo={`Vendido em ${nomeMesAtual} (${vendasDoMes.length} ${vendasDoMes.length === 1 ? "venda" : "vendas"})`}
        />
        <CartaoEstatistica
          icone={Percent}
          corFundoIcone="#fdf4ff"
          corIcone="#a855f7"
          valor={formatarMoeda(totalDescontoNoMes)}
          rotulo={`Desconto concedido em ${nomeMesAtual}`}
        />
      </div>

      {carregando ? (
        <div className="estado-carregando">Carregando vendas...</div>
      ) : (
        <div className="cartao">
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Comprador</th>
                  <th>Valor Total</th>
                  <th>Desconto</th>
                  <th className="th--direita">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr key={venda.id}>
                    <td>{formatarData(venda.data)}</td>
                    <td>{venda.nomeComprador || "—"}</td>
                    <td>{formatarMoeda(venda.valorTotal)}</td>
                    <td>
                      {venda.desconto > 0 ? (
                        <span className="selo selo--ok">{formatarMoeda(venda.desconto)}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className="acoes-tabela">
                        <button onClick={() => abrirDetalhe(venda)} className="acao-editar" title="Ver itens">
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vendas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="tabela__vazio">
                      Nenhuma venda registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalNovaVendaAberto && carregandoProdutos && (
        <div className="sobreposicao-modal">
          <div className="modal modal--pequeno">
            <div className="modal__cabecalho">
              <h2 className="modal__titulo">Nova Venda</h2>
              <button onClick={() => definirModalNovaVendaAberto(false)} className="modal__fechar">
                <X size={20} />
              </button>
            </div>
            <div className="modal__corpo">
              {erroProdutos && <div className="mensagem-erro">{erroProdutos}</div>}
              <div className="estado-carregando">Carregando produtos disponíveis...</div>
            </div>
          </div>
        </div>
      )}

      {modalNovaVendaAberto && !carregandoProdutos && !erroProdutos && (
        <ModalNovaVenda
          produtos={produtosParaVenda}
          enviando={registrando}
          erroEnvio={erroRegistrar}
          aoFechar={() => definirModalNovaVendaAberto(false)}
          aoConfirmar={confirmarNovaVenda}
        />
      )}

      {vendaSelecionadaId && (
        <ModalDetalheVenda
          venda={detalheVenda?.venda}
          itens={detalheVenda?.itens || []}
          carregando={carregandoDetalhe}
          erro={erroDetalhe}
          aoFechar={() => definirVendaSelecionadaId(null)}
        />
      )}

      <Notificacao visivel={aviso.visivel} mensagem={aviso.mensagem} tipo={aviso.tipo} aoFechar={fecharAviso} />
    </div>
  );
}

export default Vendas;
