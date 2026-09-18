import { useEffect, useState } from "react";
import { Filter, Package, TrendingUp, AlertTriangle, XCircle } from "lucide-react";
import { buscarEstoque } from "../../services/api";
import { METADADOS_STATUS_ESTOQUE } from "../../data/constantes";
import CartaoEstatistica from "../../components/CartaoEstatistica/CartaoEstatistica";
import "./Estoque.css";

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Estoque() {
  const [itens, definirItens] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState("");
  const [filtroCategoria, definirFiltroCategoria] = useState("Todas as Categorias");

  useEffect(() => {
    async function carregar() {
      definirCarregando(true);
      definirErro("");
      try {
        const dados = await buscarEstoque();
        definirItens(dados);
      } catch (erroBusca) {
        definirErro(erroBusca.message);
      } finally {
        definirCarregando(false);
      }
    }
    carregar();
  }, []);

  const categorias = Array.from(new Set(itens.map((item) => item.categoria).filter(Boolean)));

  const linhas = itens.filter(
    (item) => filtroCategoria === "Todas as Categorias" || item.categoria === filtroCategoria
  );

  const totalItens = itens.reduce((soma, item) => soma + item.quantidadeEstoque, 0);
  const valorTotal = itens.reduce((soma, item) => soma + item.quantidadeEstoque * item.preco, 0);
  const quantidadeBaixa = itens.filter((item) => item.statusEstoque === "estoque_baixo").length;
  const quantidadeEsgotada = itens.filter((item) => item.statusEstoque === "esgotado").length;

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Controle de Estoque</h1>
          <p className="cabecalho-pagina__subtitulo">Gerencie e monitore os níveis de estoque</p>
        </div>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      <div className="grade-estatisticas grade-estatisticas--4">
        <CartaoEstatistica icone={Package} corFundoIcone="#eff6ff" corIcone="#3b82f6" valor={totalItens} rotulo="Itens em Estoque" />
        <CartaoEstatistica icone={TrendingUp} corFundoIcone="#ecfdf5" corIcone="#10b981" valor={formatarMoeda(valorTotal)} rotulo="Valor Total" />
        <CartaoEstatistica icone={AlertTriangle} corFundoIcone="#fffbeb" corIcone="#d97706" valor={quantidadeBaixa} rotulo="Estoque Baixo" />
        <CartaoEstatistica icone={XCircle} corFundoIcone="#fef2f2" corIcone="#ef4444" valor={quantidadeEsgotada} rotulo="Esgotado" />
      </div>

      <div className="linha-filtros">
        <span className="linha-filtros__icone">
          <Filter size={18} />
        </span>
        <select value={filtroCategoria} onChange={(e) => definirFiltroCategoria(e.target.value)} className="selecao selecao--auto">
          <option>Todas as Categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria}>{categoria}</option>
          ))}
        </select>
      </div>

      {carregando ? (
        <div className="estado-carregando">Carregando estoque...</div>
      ) : (
        <div className="cartao">
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço Un.</th>
                  <th>Qtd.</th>
                  <th>Estoque Mínimo</th>
                  <th>Valor Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((item) => {
                  const metadados = METADADOS_STATUS_ESTOQUE[item.statusEstoque] || METADADOS_STATUS_ESTOQUE.normal;
                  return (
                    <tr key={item.id}>
                      <td className="produto-nome">{item.nome}</td>
                      <td>
                        <span className="selo selo--categoria">{item.categoria || "—"}</span>
                      </td>
                      <td>{formatarMoeda(item.preco)}</td>
                      <td className={metadados.texto}>{item.quantidadeEstoque}</td>
                      <td>{item.estoqueMinimo}</td>
                      <td>{formatarMoeda(item.preco * item.quantidadeEstoque)}</td>
                      <td>
                        <span className={`selo ${metadados.selo}`}>{metadados.rotulo}</span>
                      </td>
                    </tr>
                  );
                })}
                {linhas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="tabela__vazio">
                      Nenhum item encontrado para o filtro selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
