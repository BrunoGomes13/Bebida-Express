import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { entrar, usuarioEstaLogado } from "../../services/api";
import logo from "../../assets/logo.svg";
import "./Login.css";

function Login() {
  const navegar = useNavigate();
  const localizacao = useLocation();

  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [erro, definirErro] = useState("");
  const [enviando, definirEnviando] = useState(false);

  if (usuarioEstaLogado()) {
    const destino = localizacao.state?.de?.pathname || "/produtos";
    return <Navigate to={destino} replace />;
  }

  async function aoEnviarFormulario(e) {
    e.preventDefault();
    definirErro("");

    if (!email.trim() || !senha) {
      definirErro("Informe e-mail e senha.");
      return;
    }

    definirEnviando(true);
    try {
      await entrar(email.trim(), senha);
      const destino = localizacao.state?.de?.pathname || "/produtos";
      navegar(destino, { replace: true });
    } catch (erroLogin) {
      definirErro(erroLogin.message);
    } finally {
      definirEnviando(false);
    }
  }

  return (
    <div className="tela-login">
      <div className="cartao-login">
        <div className="cartao-login__cabecalho">
          <div className="cartao-login__logo">
            <img src={logo} alt="" className="cartao-login__logo-img" />
          </div>
          <div>
            <h1 className="cartao-login__titulo">BebidaExpress</h1>
            <p className="cartao-login__subtitulo">Acesse o painel administrativo</p>
          </div>
        </div>

        <form onSubmit={aoEnviarFormulario} className="cartao-login__form">
          {erro && <div className="mensagem-erro">{erro}</div>}

          <div className="campo">
            <label className="campo__rotulo">
              E-mail <span className="campo__obrigatorio">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => definirEmail(e.target.value)}
              className="entrada"
              placeholder="admin@bebidaexpress.com"
              autoComplete="username"
            />
          </div>

          <div className="campo">
            <label className="campo__rotulo">
              Senha <span className="campo__obrigatorio">*</span>
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => definirSenha(e.target.value)}
              className="entrada"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="botao botao--primario botao--largura-total" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
