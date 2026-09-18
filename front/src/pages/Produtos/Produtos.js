import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Package } from "lucide-react";
import { buscarProdutos, buscarCategorias, criarProduto, atualizarProduto, inativarProduto } from "../../services/api";
import { METADADOS_STATUS_ESTOQUE, OPCOES_STATUS_PRODUTO } from "../../data/constantes";
import Notificacao from "../../components/Notificacao/Notificacao";
import ModalProduto from "../../components/ModalProduto/ModalProduto";
import ModalConfirmacao from "../../components/ModalConfirmacao/ModalConfirmacao";
import "./Produtos.css";

const FORMULARIO_VAZIO = {
  codigo: "",
  nome: "",
  descricao: "",
  categoria: "",
  preco: "",
  quantidadeEstoque: "0",
  estoqueMinimo: "5",
  imagem: "",
};

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Produtos() {
  const [produtos, definirProdutos] = useState([]);
  const [categorias, definirCategorias] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState("");

  const [termoBusca, definirTermoBusca] = useState("");
  const [filtroCategoria, definirFiltroCategoria] = useState("");
  const [filtroStatus, definirFiltroStatus] = useState("");

  const [modalAberto, definirModalAberto] = useState(false);
  const [produtoEmEdicao, definirProdutoEmEdicao] = useState(null);
  const [formulario, definirFormulario] = useState(FORMULARIO_VAZIO);
  const [errosFormulario, definirErrosFormulario] = useState({});
  const [enviando, definirEnviando] = useState(false);
  const [erroEnvio, definirErroEnvio] = useState("");

  const [produtoParaInativar, definirProdutoParaInativar] = useState(null);
  const [inativando, definirInativando] = useState(false);
  const [erroInativar, definirErroInativar] = useState("");

  const [aviso, definirAviso] = useState({ visivel: false, mensagem: "", tipo: "sucesso" });

  function mostrarAviso(mensagem, tipo = "sucesso") {
    definirAviso({ visivel: true, mensagem, tipo });
    setTimeout(() => fecharAviso(), 3000);
  }

  function fecharAviso() {
    definirAviso((anterior) => ({ ...anterior, visivel: false }));
  }

  async function recarregar(filtros) {
    definirCarregando(true);
    definirErro("");
    try {
      const dados = await buscarProdutos(filtros);
      definirProdutos(dados);
    } catch (erroBusca) {
      definirErro(erroBusca.message);
    } finally {
      definirCarregando(false);
    }
  }

  useEffect(() => {
    buscarCategorias()
      .then(definirCategorias)
      .catch((erroCategorias) => definirErro(erroCategorias.message));
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => {
      recarregar({ busca: termoBusca, categoria: filtroCategoria, status: filtroStatus });
    }, 350);
    return () => clearTimeout(temporizador);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoBusca, filtroCategoria, filtroStatus]);

  function abrirModalNovo() {
    definirProdutoEmEdicao(null);
    definirFormulario(FORMULARIO_VAZIO);
    definirErrosFormulario({});
    definirErroEnvio("");
    definirModalAberto(true);
  }

  function abrirModalEditar(produto) {
    definirProdutoEmEdicao(produto);
    definirFormulario({
      codigo: produto.codigo,
      nome: produto.nome,
      descricao: produto.descricao || "",
      categoria: produto.categoria?.id || "",
      preco: String(produto.preco),
      quantidadeEstoque: String(produto.quantidadeEstoque),
      estoqueMinimo: String(produto.estoqueMinimo),
      imagem: produto.imagem || "",
    });
    definirErrosFormulario({});
    definirErroEnvio("");
    definirModalAberto(true);
  }

  function validarFormulario() {
    const erros = {};
    if (!formulario.codigo.trim()) erros.codigo = "Informe o código do produto.";
    if (!formulario.nome.trim()) erros.nome = "Informe o nome do produto.";
    if (!formulario.categoria) erros.categoria = "Selecione uma categoria.";
    if (!formulario.preco || Number(formulario.preco) <= 0) erros.preco = "Informe um preço válido.";
    if (formulario.quantidadeEstoque === "" || Number(formulario.quantidadeEstoque) < 0)
      erros.quantidadeEstoque = "Informe uma quantidade válida.";
    if (formulario.estoqueMinimo === "" || Number(formulario.estoqueMinimo) < 0)
      erros.estoqueMinimo = "Informe um estoque mínimo válido.";
    return erros;
  }

  async function aoEnviarFormulario(e) {
    e.preventDefault();
    const erros = validarFormulario();
    definirErrosFormulario(erros);
    if (Object.keys(erros).length > 0) return;

    const corpo = {
      codigo: formulario.codigo.trim(),
      nome: formulario.nome.trim(),
      descricao: formulario.descricao.trim(),
      categoria: formulario.categoria,
      preco: Number(formulario.preco),
      quantidadeEstoque: Number(formulario.quantidadeEstoque),
      estoqueMinimo: Number(formulario.estoqueMinimo),
      imagem: formulario.imagem.trim(),
    };

    definirEnviando(true);
    definirErroEnvio("");
    try {
      if (produtoEmEdicao) {
        await atualizarProduto(produtoEmEdicao.id, corpo);
        mostrarAviso("Produto atualizado com sucesso.");
      } else {
        await criarProduto(corpo);
        mostrarAviso("Produto cadastrado com sucesso.");
      }
      definirModalAberto(false);
      await recarregar({ busca: termoBusca, categoria: filtroCategoria, status: filtroStatus });
    } catch (erroSalvar) {
      definirErroEnvio(erroSalvar.message);
    } finally {
      definirEnviando(false);
    }
  }

  async function confirmarInativacao() {
    definirInativando(true);
    definirErroInativar("");
    try {
      await inativarProduto(produtoParaInativar.id);
      definirProdutoParaInativar(null);
      mostrarAviso("Produto inativado.");
      await recarregar({ busca: termoBusca, categoria: filtroCategoria, status: filtroStatus });
    } catch (erroInativarProduto) {
      definirErroInativar(erroInativarProduto.message);
    } finally {
      definirInativando(false);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Gestão de Produtos</h1>
          <p className="cabecalho-pagina__subtitulo">{produtos.length} produtos encontrados</p>
        </div>
        <button onClick={abrirModalNovo} className="botao botao--primario">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="campo-busca">
        <span className="campo-busca__icone">
          <Search size={18} />
        </span>
        <input
          value={termoBusca}
          onChange={(e) => definirTermoBusca(e.target.value)}
          placeholder="Buscar produtos..."
          className="campo-busca__entrada"
        />
      </div>

      <div className="linha-filtros">
        <select value={filtroCategoria} onChange={(e) => definirFiltroCategoria(e.target.value)} className="selecao selecao--auto">
          <option value="">Todas as Categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nome}
            </option>
          ))}
        </select>
        <select value={filtroStatus} onChange={(e) => definirFiltroStatus(e.target.value)} className="selecao selecao--auto">
          {OPCOES_STATUS_PRODUTO.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      {carregando ? (
        <div className="estado-carregando">Carregando produtos...</div>
      ) : (
        <div className="cartao">
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th className="th--direita">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const metadados = METADADOS_STATUS_ESTOQUE[produto.statusEstoque] || METADADOS_STATUS_ESTOQUE.normal;
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="produto-info">
                          <div className="produto-thumb">
                            {produto.imagem ? <img src={produto.imagem} alt="" /> : <Package size={18} />}
                          </div>
                          <div>
                            <div className="produto-nome">{produto.nome}</div>
                            <div className="produto-codigo">{produto.codigo}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="selo selo--categoria">{produto.categoria?.nome || "—"}</span>
                      </td>
                      <td>{formatarMoeda(produto.preco)}</td>
                      <td className={metadados.texto}>{produto.quantidadeEstoque}</td>
                      <td>
                        <span className={`selo ${produto.status === "ativo" ? "selo--ativo" : "selo--inativo"}`}>
                          {produto.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="acoes-tabela">
                          <button onClick={() => abrirModalEditar(produto)} className="acao-editar" title="Editar">
                            <Pencil size={16} />
                          </button>
                          {produto.status === "ativo" && (
                            <button
                              onClick={() => definirProdutoParaInativar(produto)}
                              className="acao-excluir"
                              title="Inativar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {produtos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="tabela__vazio">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAberto && (
        <ModalProduto
          formulario={formulario}
          definirFormulario={definirFormulario}
          erros={errosFormulario}
          categorias={categorias}
          emEdicao={!!produtoEmEdicao}
          enviando={enviando}
          erroEnvio={erroEnvio}
          aoFechar={() => definirModalAberto(false)}
          aoEnviar={aoEnviarFormulario}
        />
      )}

      {produtoParaInativar && (
        <ModalConfirmacao
          titulo="Inativar produto"
          mensagem={`"${produtoParaInativar.nome}" será marcado como inativo. O histórico de vendas é preservado.`}
          rotuloConfirmar="Inativar"
          carregando={inativando}
          erro={erroInativar}
          aoCancelar={() => definirProdutoParaInativar(null)}
          aoConfirmar={confirmarInativacao}
        />
      )}

      <Notificacao visivel={aviso.visivel} mensagem={aviso.mensagem} tipo={aviso.tipo} aoFechar={fecharAviso} />
    </div>
  );
}

export default Produtos;
