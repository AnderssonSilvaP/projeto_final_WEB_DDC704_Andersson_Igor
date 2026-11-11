function errorHandler(err, req, res, next) {
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || 'Erro interno do servidor';

  if (err.name === 'CastError') {
    status = 404;
    message = `Recurso não encontrado: ${err.value}`;
  } else if (err.code === 11000) {
    status = 400;
    message = `Já existe um registro com este valor para: ${Object.keys(err.keyValue).join(', ')}`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
