import { X } from "lucide-react";
import "./ModalProduto.css";

function ModalProduto({ formulario, definirFormulario, erros, categorias, emEdicao, enviando, erroEnvio, aoFechar, aoEnviar }) {
  function atualizar(campo, valor) {
    definirFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  return (
    <div className="sobreposicao-modal">
      <div className="modal">
        <div className="modal__cabecalho">
          <h2 className="modal__titulo">{emEdicao ? "Editar Produto" : "Novo Produto"}</h2>
          <button onClick={aoFechar} className="modal__fechar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={aoEnviar} className="modal__corpo">
          {erroEnvio && <div className="mensagem-erro">{erroEnvio}</div>}

          <div className="grade-campos grade-campos--2">
            <div className="campo">
              <label className="campo__rotulo">
                Código <span className="campo__obrigatorio">*</span>
              </label>
              <input
                value={formulario.codigo}
                onChange={(e) => atualizar("codigo", e.target.value)}
                className={`entrada ${erros.codigo ? "entrada--erro" : ""}`}
                placeholder="Ex: BEV001"
              />
              {erros.codigo && <p className="campo__erro">{erros.codigo}</p>}
            </div>

            <div className="campo">
              <label className="campo__rotulo">
                Categoria <span className="campo__obrigatorio">*</span>
              </label>
              <select value={formulario.categoria} onChange={(e) => atualizar("categoria", e.target.value)} className="selecao">
                <option value="">Selecione...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {erros.categoria && <p className="campo__erro">{erros.categoria}</p>}
            </div>
          </div>

          <div className="campo">
            <label className="campo__rotulo">
              Nome do Produto <span className="campo__obrigatorio">*</span>
            </label>
            <input
              value={formulario.nome}
              onChange={(e) => atualizar("nome", e.target.value)}
              className={`entrada ${erros.nome ? "entrada--erro" : ""}`}
              placeholder="Ex: Cerveja Pilsen Lata 350ml"
            />
            {erros.nome && <p className="campo__erro">{erros.nome}</p>}
          </div>

          <div className="campo">
            <label className="campo__rotulo">Descrição</label>
            <textarea
              value={formulario.descricao}
              onChange={(e) => atualizar("descricao", e.target.value)}
              rows={2}
              className="entrada"
              placeholder="Detalhes do produto..."
            />
          </div>

          <div className="grade-campos grade-campos--2">
            <div className="campo">
              <label className="campo__rotulo">
                Preço (R$) <span className="campo__obrigatorio">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formulario.preco}
                onChange={(e) => atualizar("preco", e.target.value)}
                className={`entrada ${erros.preco ? "entrada--erro" : ""}`}
                placeholder="Ex: 3.50"
              />
              {erros.preco && <p className="campo__erro">{erros.preco}</p>}
            </div>

            <div className="campo">
              <label className="campo__rotulo">Imagem (URL)</label>
              <input
                value={formulario.imagem}
                onChange={(e) => atualizar("imagem", e.target.value)}
                className="entrada"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grade-campos grade-campos--2">
            <div className="campo">
              <label className="campo__rotulo">
                Quantidade em Estoque <span className="campo__obrigatorio">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formulario.quantidadeEstoque}
                onChange={(e) => atualizar("quantidadeEstoque", e.target.value)}
                className={`entrada ${erros.quantidadeEstoque ? "entrada--erro" : ""}`}
                placeholder="Ex: 100"
              />
              {erros.quantidadeEstoque && <p className="campo__erro">{erros.quantidadeEstoque}</p>}
            </div>

            <div className="campo">
              <label className="campo__rotulo">
                Estoque Mínimo <span className="campo__obrigatorio">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formulario.estoqueMinimo}
                onChange={(e) => atualizar("estoqueMinimo", e.target.value)}
                className={`entrada ${erros.estoqueMinimo ? "entrada--erro" : ""}`}
                placeholder="Ex: 5"
              />
              {erros.estoqueMinimo && <p className="campo__erro">{erros.estoqueMinimo}</p>}
            </div>
          </div>

          <div className="modal__rodape">
            <button type="button" onClick={aoFechar} className="botao botao--secundario botao--bloco" disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="botao botao--primario botao--bloco" disabled={enviando}>
              {enviando ? "Salvando..." : emEdicao ? "Salvar Alterações" : "Cadastrar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalProduto;
