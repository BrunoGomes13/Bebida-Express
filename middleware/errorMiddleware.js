// Chamado quando nenhuma rota REST corresponde à requisição
const naoEncontrado = (req, res, next) => {
  const erro = new Error(`Rota não encontrada: ${req.originalUrl}`);
  res.status(404);
  next(erro);
};

// Middleware final: captura qualquer erro passado via next(erro) e
// devolve uma resposta JSON padronizada em vez do HTML padrão do Express.
const tratadorDeErros = (erro, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    mensagem: erro.message,
    stack: process.env.NODE_ENV === 'producao' ? undefined : erro.stack,
  });
};

module.exports = { naoEncontrado, tratadorDeErros };
