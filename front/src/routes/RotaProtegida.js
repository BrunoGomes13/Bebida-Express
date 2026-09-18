import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usuarioEstaLogado, buscarMeuPerfil } from "../services/api";

function RotaProtegida() {
  const [situacao, definirSituacao] = useState("verificando");
  const localizacao = useLocation();

  useEffect(() => {
    async function verificarAcesso() {
      if (!usuarioEstaLogado()) {
        definirSituacao("negado");
        return;
      }

      // GraphQL não expõe consulta de perfil ("me"), então a confirmação
      // de que o token ainda é válido é feita na API REST.
      try {
        await buscarMeuPerfil();
        definirSituacao("autorizado");
      } catch (erro) {
        definirSituacao("negado");
      }
    }

    verificarAcesso();
  }, []);

  if (situacao === "verificando") {
    return <div className="estado-carregando">Verificando acesso...</div>;
  }

  if (situacao === "negado") {
    return <Navigate to="/login" state={{ de: localizacao }} replace />;
  }

  return <Outlet />;
}

export default RotaProtegida;
