import "./CartaoEstatistica.css";

function CartaoEstatistica({ icone: Icone, corFundoIcone, corIcone, valor, rotulo }) {
  return (
    <div className="cartao-estatistica">
      <div className="cartao-estatistica__icone" style={{ background: corFundoIcone }}>
        <Icone size={20} color={corIcone} />
      </div>
      <div>
        <p className="cartao-estatistica__valor">{valor}</p>
        <p className="cartao-estatistica__rotulo">{rotulo}</p>
      </div>
    </div>
  );
}

export default CartaoEstatistica;
