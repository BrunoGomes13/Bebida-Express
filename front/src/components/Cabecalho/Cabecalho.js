import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { ITENS_MENU } from "../BarraLateral/BarraLateral";
import "./Cabecalho.css";

function Cabecalho({ definirBarraLateralAberta }) {
  const localizacao = useLocation();
  const itemAtual = ITENS_MENU.find((item) => localizacao.pathname.startsWith(item.caminho));

  return (
    <div className="cabecalho-mobile">
      <button onClick={() => definirBarraLateralAberta(true)} className="cabecalho-mobile__botao">
        <Menu size={22} />
      </button>
      <p className="cabecalho-mobile__titulo">{itemAtual?.rotulo}</p>
    </div>
  );
}

export default Cabecalho;
