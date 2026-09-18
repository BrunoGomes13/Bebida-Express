import { X } from "lucide-react";
import "./ModalCategoria.css";

function ModalCategoria({ formulario, definirFormulario, erros, emEdicao, enviando, erroEnvio, aoFechar, aoEnviar }) {
  function atualizar(campo, valor) {
    definirFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  return (
    <div className="sobreposicao-modal">
      <div className="modal">
        <div className="modal__cabecalho">
          <h2 className="modal__titulo">{emEdicao ? "Editar Categoria" : "Nova Categoria"}</h2>
          <button onClick={aoFechar} className="modal__fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={aoEnviar} className="modal__corpo">
          {erroEnvio && <div className="mensagem-erro">{erroEnvio}</div>}

          <div className="campo">
            <label className="campo__rotulo">
              Nome da Categoria <span className="campo__obrigatorio">*</span>
            </label>
            <input
              value={formulario.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              className={`entrada ${erros.nome ? "entrada--erro" : ""}`}
              placeholder="Ex: Cerveja"
            />
            {erros.nome && <p className="campo__erro">{erros.nome}</p>}
          </div>

          <div className="campo">
            <label className="campo__rotulo">Descrição</label>
            <textarea
              value={formulario.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
              rows={3}
              className="entrada"
              placeholder="Detalhes da categoria..."
            />
          </div>

          <div className="modal__rodape">
            <button type="button" onClick={aoFechar} className="botao botao--secundario botao--bloco" disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
              {enviando ? "Salvando..." : emEdicao ? "Salvar Alterações" : "Cadastrar Categoria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalCategoria;
