import "./Notificacao.css";

function Notificacao({ mensagem, tipo, visivel, aoFechar }) {
  if (!visivel) return null;

  return (
    <div className={`notificacao notificacao--${tipo}`}>
      <span>{mensagem}</span>
      <button className="notificacao__fechar" onClick={aoFechar}>
        ×
      </button>
    </div>
  );
}

export default Notificacao;
