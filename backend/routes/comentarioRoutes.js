const express = require("express")
const { pool } = require("../config/supabaseClient")
const { enviarEmail } = require("../config/email")

const router = express.Router()

// Adicionar comentário
router.post("/", async (req, res) => {
  try {
    const { desafio_id, mensagem } = req.body
    const usuarioId = req.usuario.id

    if (!mensagem || mensagem.trim().length === 0) {
      return res.status(400).json({ mensagem: "Comentário não pode estar vazio" })
    }

    const resultado = await pool.query(
      "INSERT INTO comentarios (desafio_id, usuario_id, mensagem) VALUES ($1, $2, $3) RETURNING *",
      [desafio_id, usuarioId, mensagem],
    )

    // Notificar contratante
    const desafioResultado = await pool.query("SELECT usuario_id FROM desafios WHERE id = $1", [desafio_id])

    const contratanteId = desafioResultado.rows[0].usuario_id
    const contratanteResultado = await pool.query("SELECT email FROM usuarios WHERE id = $1", [contratanteId])

    if (contratanteResultado.rows.length > 0) {
      await enviarEmail(
        contratanteResultado.rows[0].email,
        "Novo comentário em seu desafio - ConectaDev",
        `<p>Alguém comentou em um de seus desafios</p>`,
      )
    }

    res.status(201).json({ comentario: resultado.rows[0] })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao adicionar comentário" })
  }
})

// Deletar comentário
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const usuarioId = req.usuario.id

    const comentarioResultado = await pool.query("SELECT desafio_id FROM comentarios WHERE id = $1", [id])

    if (comentarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Comentário não encontrado" })
    }

    const desafioId = comentarioResultado.rows[0].desafio_id

    // Verifica se é proprietário do desafio
    const desafioResultado = await pool.query("SELECT usuario_id FROM desafios WHERE id = $1", [desafioId])

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ mensagem: "Sem permissão para deletar este comentário" })
    }

    await pool.query("DELETE FROM comentarios WHERE id = $1", [id])

    res.json({ mensagem: "Comentário deletado com sucesso" })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao deletar comentário" })
  }
})

module.exports = router
