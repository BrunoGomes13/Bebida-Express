import { useState } from "react";
import { Outlet } from "react-router-dom";
import BarraLateral from "../BarraLateral/BarraLateral";
import Cabecalho from "../Cabecalho/Cabecalho";
import "./LayoutPainel.css";

function LayoutPainel() {
  const [barraLateralAberta, definirBarraLateralAberta] = useState(false);

  return (
    <div className="aplicativo">
      <BarraLateral barraLateralAberta={barraLateralAberta} definirBarraLateralAberta={definirBarraLateralAberta} />

      <div className="conteudo-principal">
        <Cabecalho definirBarraLateralAberta={definirBarraLateralAberta} />
        <main className="area-principal">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutPainel;
