const { readDb } = require('../data/store');

function login(body) {
  const { username, password } = body || {};
  const db = readDb();
  const user = db.users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return { status: 401, data: { error: 'Credenciais inválidas' } };
  }

  return {
    status: 200,
    data: {
      id: user.id,
      username: user.username,
      role: user.role,
      token: `mock-token-${user.id}-${Date.now()}`
    }
  };
}

module.exports = { login };
