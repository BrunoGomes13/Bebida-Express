import { Routes, Route, Navigate } from "react-router-dom";
import RotaProtegida from "./RotaProtegida";
import LayoutPainel from "../components/Layout/LayoutPainel";
import Login from "../components/Login/Login";
import Produtos from "../pages/Produtos/Produtos";
import Categorias from "../pages/Categorias/Categorias";
import Estoque from "../pages/Estoque/Estoque";
import Vendas from "../pages/Vendas/Vendas";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RotaProtegida />}>
        <Route element={<LayoutPainel />}>
          <Route index element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/vendas" element={<Vendas />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
