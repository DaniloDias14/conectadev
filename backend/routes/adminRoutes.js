const express = require("express")
const { pool } = require("../config/supabaseClient")

const router = express.Router()

// Métricas
router.get("/metricas", async (req, res) => {
  try {
    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({ mensagem: "Acesso restrito" })
    }

    const usuariosResultado = await pool.query("SELECT COUNT(*) FROM usuarios")
    const desafiosResultado = await pool.query("SELECT COUNT(*) FROM desafios WHERE status = 'ativo'")
    const propostasResultado = await pool.query("SELECT COUNT(*) FROM propostas")
    const concluidosResultado = await pool.query("SELECT COUNT(*) FROM desafios WHERE status = 'concluido'")

    res.json({
      totalUsuarios: Number.parseInt(usuariosResultado.rows[0].count),
      desafiosAtivos: Number.parseInt(desafiosResultado.rows[0].count),
      totalPropostas: Number.parseInt(propostasResultado.rows[0].count),
      desafiosConcluidos: Number.parseInt(concluidosResultado.rows[0].count),
    })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao obter métricas" })
  }
})

module.exports = router
