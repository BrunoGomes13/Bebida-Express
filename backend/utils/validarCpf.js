// Validação de CPF: checa só o formato (11 dígitos, não repetidos), sem
// conferir os dígitos verificadores. Optamos por não exigir um CPF real
// aqui porque este é um sistema interno de vendas, não uma validação de
// identidade — e exigir o dígito verificador de verdade travava até CPFs
// de teste digitados na correria do caixa.
function validarCpf(cpf) {
  if (!cpf) return false;

  const numeros = cpf.replace(/\D/g, '');

  if (numeros.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numeros)) return false; // ex: 111.111.111-11

  return true;
}

module.exports = validarCpf;
