import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { buscarCategorias, criarCategoria, atualizarCategoria, inativarCategoria } from "../../services/api";
import Notificacao from "../../components/Notificacao/Notificacao";
import ModalCategoria from "../../components/ModalCategoria/ModalCategoria";
import ModalConfirmacao from "../../components/ModalConfirmacao/ModalConfirmacao";
import "./Categorias.css";

const FORMULARIO_VAZIO = { nome: "", descricao: "" };

function Categorias() {
  const [categorias, definirCategorias] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState("");

  const [modalAberto, definirModalAberto] = useState(false);
  const [categoriaEmEdicao, definirCategoriaEmEdicao] = useState(null);
  const [formulario, definirFormulario] = useState(FORMULARIO_VAZIO);
  const [errosFormulario, definirErrosFormulario] = useState({});
  const [enviando, definirEnviando] = useState(false);
  const [erroEnvio, definirErroEnvio] = useState("");

  const [categoriaParaInativar, definirCategoriaParaInativar] = useState(null);
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

  async function recarregar() {
    definirCarregando(true);
    definirErro("");
    try {
      const dados = await buscarCategorias();
      definirCategorias(dados);
    } catch (erroBusca) {
      definirErro(erroBusca.message);
    } finally {
      definirCarregando(false);
    }
  }

  useEffect(() => {
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function abrirModalNovo() {
    definirCategoriaEmEdicao(null);
    definirFormulario(FORMULARIO_VAZIO);
    definirErrosFormulario({});
    definirErroEnvio("");
    definirModalAberto(true);
  }

  function abrirModalEditar(categoria) {
    definirCategoriaEmEdicao(categoria);
    definirFormulario({ nome: categoria.nome, descricao: categoria.descricao || "" });
    definirErrosFormulario({});
    definirErroEnvio("");
    definirModalAberto(true);
  }

  function validarFormulario() {
    const erros = {};
    if (!formulario.nome.trim()) erros.nome = "Informe o nome da categoria.";
    return erros;
  }

  async function aoEnviarFormulario(e) {
    e.preventDefault();
    const erros = validarFormulario();
    definirErrosFormulario(erros);
    if (Object.keys(erros).length > 0) return;

    const corpo = { nome: formulario.nome.trim(), descricao: formulario.descricao.trim() };

    definirEnviando(true);
    definirErroEnvio("");
    try {
      if (categoriaEmEdicao) {
        await atualizarCategoria(categoriaEmEdicao.id, corpo);
        mostrarAviso("Categoria atualizada com sucesso.");
      } else {
        await criarCategoria(corpo);
        mostrarAviso("Categoria cadastrada com sucesso.");
      }
      definirModalAberto(false);
      await recarregar();
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
      await inativarCategoria(categoriaParaInativar.id);
      definirCategoriaParaInativar(null);
      mostrarAviso("Categoria inativada.");
      await recarregar();
    } catch (erroInativarCategoria) {
      definirErroInativar(erroInativarCategoria.message);
    } finally {
      definirInativando(false);
    }
  }

  return (
    <div>
      <div className="cabecalho-pagina">
        <div>
          <h1 className="cabecalho-pagina__titulo">Gestão de Categorias</h1>
          <p className="cabecalho-pagina__subtitulo">{categorias.length} categorias cadastradas</p>
        </div>
        <button onClick={abrirModalNovo} className="botao botao--primario">
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      {erro && <div className="mensagem-erro">{erro}</div>}

      {carregando ? (
        <div className="estado-carregando">Carregando categorias...</div>
      ) : (
        <div className="cartao">
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Status</th>
                  <th className="th--direita">Ações</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.id}>
                    <td>
                      <div className="produto-info">
                        <div className="produto-thumb">
                          <Tag size={16} />
                        </div>
                        <span className="produto-nome">{categoria.nome}</span>
                      </div>
                    </td>
                    <td>{categoria.descricao || "—"}</td>
                    <td>
                      <span className={`selo ${categoria.status === "ativo" ? "selo--ativo" : "selo--inativo"}`}>
                        {categoria.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-tabela">
                        <button onClick={() => abrirModalEditar(categoria)} className="acao-editar" title="Editar">
                          <Pencil size={16} />
                        </button>
                        {categoria.status === "ativo" && (
                          <button
                            onClick={() => definirCategoriaParaInativar(categoria)}
                            className="acao-excluir"
                            title="Inativar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td colSpan={4} className="tabela__vazio">
                      Nenhuma categoria cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalAberto && (
        <ModalCategoria
          formulario={formulario}
          definirFormulario={definirFormulario}
          erros={errosFormulario}
          emEdicao={!!categoriaEmEdicao}
          enviando={enviando}
          erroEnvio={erroEnvio}
          aoFechar={() => definirModalAberto(false)}
          aoEnviar={aoEnviarFormulario}
        />
      )}

      {categoriaParaInativar && (
        <ModalConfirmacao
          titulo="Inativar categoria"
          mensagem={`"${categoriaParaInativar.nome}" será marcada como inativa. Produtos já vinculados a ela não são afetados.`}
          rotuloConfirmar="Inativar"
          carregando={inativando}
          erro={erroInativar}
          aoCancelar={() => definirCategoriaParaInativar(null)}
          aoConfirmar={confirmarInativacao}
        />
      )}

      <Notificacao visivel={aviso.visivel} mensagem={aviso.mensagem} tipo={aviso.tipo} aoFechar={fecharAviso} />
    </div>
  );
}

export default Categorias;
