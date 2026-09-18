// Metadados de exibição para o campo "statusEstoque" que a API calcula
// em cada produto (normal | estoque_baixo | esgotado).
export const METADADOS_STATUS_ESTOQUE = {
  normal: { rotulo: "Normal", selo: "selo--ok", texto: "texto-estoque--ok" },
  estoque_baixo: { rotulo: "Estoque Baixo", selo: "selo--baixo", texto: "texto-estoque--baixo" },
  esgotado: { rotulo: "Esgotado", selo: "selo--esgotado", texto: "texto-estoque--esgotado" },
};

export const OPCOES_STATUS_PRODUTO = [
  { valor: "", rotulo: "Produtos Ativos" },
  { valor: "inativo", rotulo: "Inativos" },
  { valor: "todos", rotulo: "Todos os Status" },
];
