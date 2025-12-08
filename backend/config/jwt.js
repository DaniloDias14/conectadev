const jwt = require("jsonwebtoken")

const gerarAccessToken = (usuarioId, tipo) => {
  return jwt.sign({ id: usuarioId, tipo }, process.env.JWT_SECRET, { expiresIn: "15m" })
}

const gerarRefreshToken = (usuarioId) => {
  return jwt.sign({ id: usuarioId }, process.env.SESSION_SECRET, { expiresIn: "7d" })
}

const verificarAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (erro) {
    return null
  }
}

const verificarRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.SESSION_SECRET)
  } catch (erro) {
    return null
  }
}

module.exports = {
  gerarAccessToken,
  gerarRefreshToken,
  verificarAccessToken,
  verificarRefreshToken,
}
