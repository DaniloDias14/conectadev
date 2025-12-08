const { verificarAccessToken } = require("../config/jwt")

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ mensagem: "Token não fornecido" })
  }

  const payload = verificarAccessToken(token)

  if (!payload) {
    return res.status(401).json({ mensagem: "Token inválido ou expirado" })
  }

  req.usuario = payload
  next()
}
