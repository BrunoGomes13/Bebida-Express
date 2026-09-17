import "./ModalConfirmacao.css";

function ModalConfirmacao({ titulo, mensagem, rotuloConfirmar, carregando, erro, aoCancelar, aoConfirmar }) {
  return (
    <div className="sobreposicao-modal">
      <div className="modal modal--pequeno">
        <div className="modal__conteudo">
          <h3 className="modal__titulo">{titulo}</h3>
          <p className="modal__mensagem">{mensagem}</p>
          {erro && <div className="mensagem-erro">{erro}</div>}
          <div className="modal__rodape">
            <button onClick={aoCancelar} className="botao botao--secundario botao--bloco" disabled={carregando}>
              Voltar
            </button>
            <button onClick={aoConfirmar} className="botao botao--perigo botao--bloco" disabled={carregando}>
              {carregando ? "Aguarde..." : rotuloConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacao;
