// Camada de acesso à API do backend Bebida Express.
//
// O backend expõe DUAS portas de entrada no mesmo servidor:
//   - GraphQL em /graphql  → usada como via PRINCIPAL (listagens, criação,
//     entrada e registro de venda).
//   - REST em /api          → usada de COMPLEMENTO para o que o schema
//     GraphQL não cobre: atualizar produto/categoria, inativar produto/
//     categoria, conferir o token (/auth/me) e ver os itens de uma venda —
//     e também como reforço quando alguma consulta GraphQL falha.
//
// Cada função exportada deixa explícito nos comentários por qual via ela
// conversa com o servidor.

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

// ── REST ──────────────────────────────────────────────────────────────
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

// ── GraphQL ───────────────────────────────────────────────────────────
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
// do REST/Mongoose (que usa "_id") — assim o resto do front nunca precisa
// se preocupar com qual via trouxe o dado.
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

// REST: GraphQL não expõe consulta de perfil ("me"), então a validação do
// token ao carregar a aplicação é feita direto na API REST.
export function buscarMeuPerfil() {
  return chamarApi("/auth/me");
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

// REST: não existe mutation de atualização no schema GraphQL.
export async function atualizarCategoria(id, dadosCategoria) {
  const dados = await chamarApi(`/categorias/${id}`, { metodo: "PUT", corpo: dadosCategoria });
  return normalizar(dados);
}

// REST: não existe mutation de inativação no schema GraphQL.
export async function inativarCategoria(id) {
  return chamarApi(`/categorias/${id}`, { metodo: "DELETE" });
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
  categoria {
    id
    nome
  }
`;

// GraphQL (principal) + REST (complemento).
// A query "produtos" do schema GraphQL só devolve produtos ATIVOS e não
// aceita filtros — então: busca/categoria são filtradas aqui no front após
// a resposta do GraphQL, e o filtro "inativo"/"todos" (que o GraphQL não
// tem como atender) cai para o REST, que já suporta esses filtros de fábrica.
export async function buscarProdutos(filtros = {}) {
  const precisaDeInativos = filtros.status === "inativo" || filtros.status === "todos";

  if (precisaDeInativos) {
    const parametros = new URLSearchParams();
    if (filtros.categoria) parametros.set("categoria", filtros.categoria);
    if (filtros.status && filtros.status !== "todos") parametros.set("status", filtros.status);
    if (filtros.busca) parametros.set("busca", filtros.busca);
    const consultaRest = parametros.toString();
    const dados = await chamarApi(`/produtos${consultaRest ? `?${consultaRest}` : ""}`);
    return dados.map(normalizar);
  }

  const consulta = `query { produtos { ${CAMPOS_PRODUTO} } }`;
  const dados = await chamarGraphQL(consulta);
  let produtos = dados.produtos.map(normalizar);

  if (filtros.categoria) {
    produtos = produtos.filter((produto) => produto.categoria?.id === filtros.categoria);
  }
  if (filtros.busca) {
    const termo = filtros.busca.toLowerCase();
    produtos = produtos.filter((produto) => produto.nome.toLowerCase().includes(termo));
  }

  return produtos;
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

// REST: não existe mutation de atualização no schema GraphQL.
export async function atualizarProduto(id, dadosProduto) {
  const dados = await chamarApi(`/produtos/${id}`, { metodo: "PUT", corpo: dadosProduto });
  return normalizar(dados);
}

// REST: não existe mutation de inativação no schema GraphQL.
export async function inativarProduto(id) {
  return chamarApi(`/produtos/${id}`, { metodo: "DELETE" });
}

// ════════════════════════════════════════════════════════════════════
// Estoque
// ════════════════════════════════════════════════════════════════════

// Achata a resposta de estoque (GraphQL ou REST) para o mesmo formato
// usado na página de Estoque.
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

// GraphQL (principal): query estoque — devolve { produto, quantidade, status }
// por item. Se o GraphQL falhar (o resolver de estoque do backend não popula
// a categoria de todo produto, o que pode gerar erro quando algum produto
// está com a categoria mal configurada), cai para a API REST, que já trata
// essa mesma situação com segurança.
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
export async function registrarVenda(itens) {
  const consulta = `
    mutation RegistrarVenda($itens: [ItemVendaInput!]!) {
      registrarVenda(itens: $itens) {
        id
        data
        valorTotal
      }
    }
  `;
  const dados = await chamarGraphQL(consulta, { itens });
  return normalizar(dados.registrarVenda);
}

// GraphQL: query vendas — o tipo Venda do schema não expõe o administrador
// que registrou a venda nem os itens vendidos, só id/data/valorTotal.
export async function buscarVendas() {
  const consulta = `
    query {
      vendas {
        id
        data
        valorTotal
      }
    }
  `;
  const dados = await chamarGraphQL(consulta);
  return dados.vendas.map(normalizar);
}

// REST: o tipo Venda do GraphQL não tem campo "itens", então o detalhe
// (usado no modal de "ver itens") vem da API REST, que já devolve
// { venda, itens } prontos.
export function obterVenda(id) {
  return chamarApi(`/vendas/${id}`);
}
