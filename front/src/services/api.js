// Camada de acesso à API do backend Bebida Express.
//
// O backend expõe DUAS portas de entrada no mesmo servidor:
//   - GraphQL em /graphql  → via PRINCIPAL de TODAS as operações abaixo.
//   - REST em /api          → usada só como REFORÇO: se a chamada GraphQL
//     falhar (schema desatualizado, erro de rede, bug pontual no resolver),
//     a função cai automaticamente para o endpoint REST equivalente.
//
// Isso exige que o schema GraphQL do backend tenha, além das consultas
// originais, também: meuPerfil, atualizarProduto, inativarProduto,
// atualizarCategoria, inativarCategoria, produtos(categoria, status, busca)
// e o tipo Venda com os campos administrador/itens.

const URL_BASE_API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const URL_GRAPHQL = process.env.REACT_APP_GRAPHQL_URL || "http://localhost:5000/graphql";

const CHAVE_TOKEN = "bebidaexpress_token";
const CHAVE_ADMINISTRADOR = "bebidaexpress_administrador";

export class ErroApi extends Error {}

function pegarToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

function montarCabecalhos() {
  const cabecalhos = { "Content-Type": "application/json" };
  const token = pegarToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;
  return cabecalhos;
}

function dispararEventoSessao() {
  window.dispatchEvent(new Event("administradorAtualizado"));
}

// ── REST (reforço) ───────────────────────────────────────────────────
async function chamarApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${URL_BASE_API}${caminho}`, {
      method: opcoes.metodo || "GET",
      headers: montarCabecalhos(),
      body: opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch (erroDeRede) {
    throw new ErroApi(`Não foi possível conectar à API REST em ${URL_BASE_API}.`);
  }

  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    throw new ErroApi(dados?.mensagem || `Erro ${resposta.status} ao acessar ${caminho}.`);
  }

  return dados;
}

// ── GraphQL (principal) ──────────────────────────────────────────────
async function chamarGraphQL(consulta, variaveis) {
  let resposta;
  try {
    resposta = await fetch(URL_GRAPHQL, {
      method: "POST",
      headers: montarCabecalhos(),
      body: JSON.stringify({ query: consulta, variables: variaveis }),
    });
  } catch (erroDeRede) {
    throw new ErroApi(`Não foi possível conectar ao GraphQL em ${URL_GRAPHQL}.`);
  }

  const json = await resposta.json();

  if (json.errors && json.errors.length > 0) {
    throw new ErroApi(json.errors[0].message || "Erro na consulta GraphQL.");
  }

  return json.data;
}

// Garante que todo produto/categoria/venda chegue às páginas sempre com
// a chave "id" preenchida, tanto vindo do GraphQL (que já usa "id") quanto
// do REST/Mongoose (que usa "_id").
function normalizar(objeto) {
  if (!objeto) return objeto;
  return { ...objeto, id: objeto.id || objeto._id };
}

// ════════════════════════════════════════════════════════════════════
// Autenticação
// ════════════════════════════════════════════════════════════════════

// GraphQL: mutation login
export async function entrar(email, senha) {
  const consulta = `
    mutation Entrar($email: String!, $senha: String!) {
      login(email: $email, senha: $senha) {
        id
        nome
        email
        token
      }
    }
  `;
  const dados = await chamarGraphQL(consulta, { email, senha });
  const administrador = { id: dados.login.id, nome: dados.login.nome, email: dados.login.email };

  localStorage.setItem(CHAVE_TOKEN, dados.login.token);
  localStorage.setItem(CHAVE_ADMINISTRADOR, JSON.stringify(administrador));
  dispararEventoSessao();

  return administrador;
}

export function sair() {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_ADMINISTRADOR);
  dispararEventoSessao();
}

export function pegarAdministradorSalvo() {
  const bruto = localStorage.getItem(CHAVE_ADMINISTRADOR);
  return bruto ? JSON.parse(bruto) : null;
}

export function usuarioEstaLogado() {
  return !!pegarToken();
}

// GraphQL (principal): query meuPerfil. REST (reforço): GET /auth/me.
export async function buscarMeuPerfil() {
  const consulta = `query { meuPerfil { id nome email status } }`;
  try {
    const dados = await chamarGraphQL(consulta);
    return dados.meuPerfil;
  } catch (erroGraphQL) {
    return chamarApi("/auth/me");
  }
}

// ════════════════════════════════════════════════════════════════════
// Categorias
// ════════════════════════════════════════════════════════════════════

// GraphQL: query categorias
export async function buscarCategorias() {
  const consulta = `
    query {
      categorias {
        id
        nome
        descricao
        status
      }
    }
  `;
  const dados = await chamarGraphQL(consulta);
  return dados.categorias.map(normalizar);
}

// GraphQL: mutation criarCategoria
export async function criarCategoria(dadosCategoria) {
  const consulta = `
    mutation CriarCategoria($dados: CategoriaInput!) {
      criarCategoria(dados: $dados) {
        id
        nome
        descricao
        status
      }
    }
  `;
  const dados = await chamarGraphQL(consulta, { dados: dadosCategoria });
  return normalizar(dados.criarCategoria);
}

// GraphQL (principal): mutation atualizarCategoria.
// REST (reforço): PUT /categorias/:id.
export async function atualizarCategoria(id, dadosCategoria) {
  const consulta = `
    mutation AtualizarCategoria($id: ID!, $dados: CategoriaUpdateInput!) {
      atualizarCategoria(id: $id, dados: $dados) {
        id
        nome
        descricao
        status
      }
    }
  `;
  try {
    const dados = await chamarGraphQL(consulta, { id, dados: dadosCategoria });
    return normalizar(dados.atualizarCategoria);
  } catch (erroGraphQL) {
    const dados = await chamarApi(`/categorias/${id}`, { metodo: "PUT", corpo: dadosCategoria });
    return normalizar(dados);
  }
}

// GraphQL (principal): mutation inativarCategoria.
// REST (reforço): DELETE /categorias/:id.
export async function inativarCategoria(id) {
  const consulta = `
    mutation InativarCategoria($id: ID!) {
      inativarCategoria(id: $id) { id status }
    }
  `;
  try {
    return await chamarGraphQL(consulta, { id });
  } catch (erroGraphQL) {
    return chamarApi(`/categorias/${id}`, { metodo: "DELETE" });
  }
}

// ════════════════════════════════════════════════════════════════════
// Produtos
// ════════════════════════════════════════════════════════════════════

const CAMPOS_PRODUTO = `
  id
  codigo
  nome
  descricao
  preco
  quantidadeEstoque
  estoqueMinimo
  statusEstoque
  status
  imagem
  categoria {
    id
    nome
  }
`;

// GraphQL (principal): query produtos(categoria, status, busca) — já aceita
// os mesmos filtros que a rota REST. REST (reforço): GET /produtos?....
export async function buscarProdutos(filtros = {}) {
  const consulta = `
    query Produtos($categoria: ID, $status: String, $busca: String) {
      produtos(categoria: $categoria, status: $status, busca: $busca) { ${CAMPOS_PRODUTO} }
    }
  `;

  try {
    const dados = await chamarGraphQL(consulta, {
      categoria: filtros.categoria || null,
      status: filtros.status === "todos" ? null : filtros.status || null,
      busca: filtros.busca || null,
    });
    let produtos = dados.produtos.map(normalizar);

    // A query GraphQL não tem um valor "todos os status" (ela sempre filtra
    // por um status específico), então quando o front pede "todos", busca
    // ativos e inativos separadamente e junta as duas listas.
    if (filtros.status === "todos") {
      const inativosConsulta = await chamarGraphQL(consulta, {
        categoria: filtros.categoria || null,
        status: "inativo",
        busca: filtros.busca || null,
      });
      produtos = produtos.concat(inativosConsulta.produtos.map(normalizar));
    }

    return produtos;
  } catch (erroGraphQL) {
    const parametros = new URLSearchParams();
    if (filtros.categoria) parametros.set("categoria", filtros.categoria);
    if (filtros.status && filtros.status !== "todos") parametros.set("status", filtros.status);
    if (filtros.busca) parametros.set("busca", filtros.busca);
    const consultaRest = parametros.toString();
    const dados = await chamarApi(`/produtos${consultaRest ? `?${consultaRest}` : ""}`);
    return dados.map(normalizar);
  }
}

// GraphQL: mutation criarProduto
export async function criarProduto(dadosProduto) {
  const consulta = `
    mutation CriarProduto($dados: ProdutoInput!) {
      criarProduto(dados: $dados) { ${CAMPOS_PRODUTO} }
    }
  `;
  const dados = await chamarGraphQL(consulta, { dados: dadosProduto });
  return normalizar(dados.criarProduto);
}

// GraphQL (principal): mutation atualizarProduto.
// REST (reforço): PUT /produtos/:id.
export async function atualizarProduto(id, dadosProduto) {
  const consulta = `
    mutation AtualizarProduto($id: ID!, $dados: ProdutoUpdateInput!) {
      atualizarProduto(id: $id, dados: $dados) { ${CAMPOS_PRODUTO} }
    }
  `;
  try {
    const dados = await chamarGraphQL(consulta, { id, dados: dadosProduto });
    return normalizar(dados.atualizarProduto);
  } catch (erroGraphQL) {
    const dados = await chamarApi(`/produtos/${id}`, { metodo: "PUT", corpo: dadosProduto });
    return normalizar(dados);
  }
}

// GraphQL (principal): mutation inativarProduto.
// REST (reforço): DELETE /produtos/:id.
export async function inativarProduto(id) {
  const consulta = `
    mutation InativarProduto($id: ID!) {
      inativarProduto(id: $id) { id status }
    }
  `;
  try {
    return await chamarGraphQL(consulta, { id });
  } catch (erroGraphQL) {
    return chamarApi(`/produtos/${id}`, { metodo: "DELETE" });
  }
}

// ════════════════════════════════════════════════════════════════════
// Estoque
// ════════════════════════════════════════════════════════════════════

function achatarItemGraphQL(item) {
  return {
    id: item.produto.id,
    nome: item.produto.nome,
    categoria: item.produto.categoria?.nome || "",
    preco: item.produto.preco,
    quantidadeEstoque: item.quantidade,
    estoqueMinimo: item.produto.estoqueMinimo,
    statusEstoque: item.status,
  };
}

function achatarItemRest(item) {
  return {
    id: item.id || item._id,
    nome: item.nome,
    categoria: item.categoria || "",
    preco: item.preco,
    quantidadeEstoque: item.quantidadeEstoque,
    estoqueMinimo: item.estoqueMinimo,
    statusEstoque: item.statusEstoque,
  };
}

// GraphQL (principal): query estoque. REST (reforço): GET /estoque.
export async function buscarEstoque() {
  const consulta = `
    query {
      estoque {
        quantidade
        status
        produto {
          id
          nome
          preco
          estoqueMinimo
          categoria { nome }
        }
      }
    }
  `;

  try {
    const dados = await chamarGraphQL(consulta);
    return dados.estoque.map(achatarItemGraphQL);
  } catch (erroGraphQL) {
    const dados = await chamarApi("/estoque");
    return dados.map(achatarItemRest);
  }
}

// ════════════════════════════════════════════════════════════════════
// Vendas
// ════════════════════════════════════════════════════════════════════

// GraphQL: mutation registrarVenda
export async function registrarVenda({ itens, nomeComprador, cpfComprador }) {
  const consulta = `
    mutation RegistrarVenda($itens: [ItemVendaInput!]!, $nomeComprador: String!, $cpfComprador: String) {
      registrarVenda(itens: $itens, nomeComprador: $nomeComprador, cpfComprador: $cpfComprador) {
        id
        data
        nomeComprador
        cpfComprador
        valorBruto
        desconto
        valorTotal
      }
    }
  `;
  const dados = await chamarGraphQL(consulta, { itens, nomeComprador, cpfComprador: cpfComprador || null });
  return normalizar(dados.registrarVenda);
}

// GraphQL: query vendas
export async function buscarVendas() {
  const consulta = `
    query {
      vendas {
        id
        data
        nomeComprador
        valorBruto
        desconto
        valorTotal
      }
    }
  `;
  const dados = await chamarGraphQL(consulta);
  return dados.vendas.map(normalizar);
}

// GraphQL (principal): query venda(id), já com administrador e itens.
// REST (reforço): GET /vendas/:id, que já devolve { venda, itens } prontos.
export async function obterVenda(id) {
  const consulta = `
    query Venda($id: ID!) {
      venda(id: $id) {
        id
        data
        nomeComprador
        cpfComprador
        valorBruto
        desconto
        valorTotal
        administrador { nome }
        itens {
          id
          quantidade
          precoUnitario
          subtotal
          produto { nome codigo }
        }
      }
    }
  `;

  try {
    const dados = await chamarGraphQL(consulta, { id });
    const { itens, ...venda } = dados.venda;
    return { venda, itens: itens.map(normalizar) };
  } catch (erroGraphQL) {
    return chamarApi(`/vendas/${id}`);
  }
}
