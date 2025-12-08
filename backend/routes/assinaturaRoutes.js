const express = require("express")
const { pool } = require("../config/supabaseClient")

const router = express.Router()

// Simular upgrade de plano
router.post("/upgrade", async (req, res) => {
  try {
    const { plano } = req.body
    const usuarioId = req.usuario.id

    if (!["gratuito", "premium", "premium_plus"].includes(plano)) {
      return res.status(400).json({ mensagem: "Plano inválido" })
    }

    const assinaturaExistente = await pool.query("SELECT id FROM assinaturas WHERE usuario_id = $1", [usuarioId])

    if (assinaturaExistente.rows.length > 0) {
      await pool.query("UPDATE assinaturas SET plano = $1 WHERE usuario_id = $2", [plano, usuarioId])
    } else {
      await pool.query("INSERT INTO assinaturas (usuario_id, plano) VALUES ($1, $2)", [usuarioId, plano])
    }

    res.json({ mensagem: `Plano atualizado para ${plano}` })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao atualizar plano" })
  }
})

module.exports = router
