function getTracking(code) {
  return {
    status: 200,
    data: {
      codigo: code,
      status: 'Em trânsito',
      ultimaAtualizacao: new Date().toISOString(),
      historico: [
        { evento: 'Postado', data: new Date(Date.now() - 86400000).toISOString() },
        { evento: 'Em trânsito para unidade de distribuição', data: new Date().toISOString() }
      ]
    }
  };
}

module.exports = { getTracking };
