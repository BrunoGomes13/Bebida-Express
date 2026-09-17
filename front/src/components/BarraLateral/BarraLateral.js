import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Package, Tag, Warehouse, Receipt, X, LogOut } from "lucide-react";
import { pegarAdministradorSalvo, sair } from "../../services/api";
import logo from "../../assets/logo.svg";
import "./BarraLateral.css";

export const ITENS_MENU = [
  { caminho: "/produtos", rotulo: "Produtos", icone: Package },
  { caminho: "/categorias", rotulo: "Categorias", icone: Tag },
  { caminho: "/estoque", rotulo: "Estoque", icone: Warehouse },
  { caminho: "/vendas", rotulo: "Vendas", icone: Receipt },
];

function BarraLateral({ barraLateralAberta, definirBarraLateralAberta }) {
  const [administrador, definirAdministrador] = useState(pegarAdministradorSalvo());
  const navegar = useNavigate();

  useEffect(() => {
    function aoAtualizarSessao() {
      definirAdministrador(pegarAdministradorSalvo());
    }
    window.addEventListener("administradorAtualizado", aoAtualizarSessao);
    return () => window.removeEventListener("administradorAtualizado", aoAtualizarSessao);
  }, []);

  function aoSair() {
    sair();
    navegar("/login", { replace: true });
  }

  const inicial = administrador?.nome?.trim()?.charAt(0) || "A";

  return (
    <>
      <aside className={`barra-lateral ${barraLateralAberta ? "barra-lateral--aberta" : ""}`}>
        <div className="barra-lateral__cabecalho">
          <div className="barra-lateral__logo">
            <img src={logo} alt="" className="barra-lateral__logo-img" />
          </div>
          <div>
            <p className="barra-lateral__marca-titulo">Admin Panel</p>
            <p className="barra-lateral__marca-subtitulo">BebidaExpress</p>
          </div>
          <button className="barra-lateral__fechar" onClick={() => definirBarraLateralAberta(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="barra-lateral__nav">
          {ITENS_MENU.map((item) => {
            const Icone = item.icone;
            return (
              <NavLink
                key={item.caminho}
                to={item.caminho}
                onClick={() => definirBarraLateralAberta(false)}
                className={({ isActive: ativo }) => `barra-lateral__item ${ativo ? "barra-lateral__item--ativo" : ""}`}
              >
                <Icone size={18} />
                {item.rotulo}
              </NavLink>
            );
          })}
        </nav>

        <div className="barra-lateral__rodape">
          <div className="barra-lateral__perfil">
            <div className="barra-lateral__avatar">{inicial}</div>
            <div style={{ minWidth: 0 }}>
              <p className="barra-lateral__perfil-nome">{administrador?.nome || "Administrador"}</p>
              <p className="barra-lateral__perfil-cargo">{administrador?.email || ""}</p>
            </div>
          </div>
          <button className="barra-lateral__sair" onClick={aoSair}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {barraLateralAberta && <div className="sobreposicao" onClick={() => definirBarraLateralAberta(false)} />}
    </>
  );
}

export default BarraLateral;
