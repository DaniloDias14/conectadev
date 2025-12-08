const express = require("express")
const { pool } = require("../config/supabaseClient")

const router = express.Router()

// Listar desafios (feed)
router.get("/", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT d.*, u.nome as usuario_nome 
       FROM desafios d 
       JOIN usuarios u ON d.usuario_id = u.id 
       WHERE d.status = 'ativo' AND d.deletado_em IS NULL 
       ORDER BY d.criado_em DESC`,
    )

    res.json({ desafios: resultado.rows })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao listar desafios" })
  }
})

// Obter detalhes de um desafio
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const desafioResultado = await pool.query("SELECT * FROM desafios WHERE id = $1 AND deletado_em IS NULL", [id])

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" })
    }

    const comentariosResultado = await pool.query(
      `SELECT c.id, c.mensagem, c.criado_em 
       FROM comentarios c 
       WHERE c.desafio_id = $1 
       ORDER BY c.criado_em DESC`,
      [id],
    )

    res.json({
      desafio: desafioResultado.rows[0],
      comentarios: comentariosResultado.rows,
    })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao obter desafio" })
  }
})

// Criar desafio
router.post("/", async (req, res) => {
  try {
    const { titulo, descricao, requisitos, linguagens, orcamento, expira_em } = req.body
    const usuarioId = req.usuario.id

    if (titulo.length < 10 || titulo.length > 200) {
      return res.status(400).json({ mensagem: "Título deve ter entre 10 e 200 caracteres" })
    }

    if (descricao.length < 50 || descricao.length > 5000) {
      return res.status(400).json({ mensagem: "Descrição deve ter entre 50 e 5000 caracteres" })
    }

    if (orcamento <= 0) {
      return res.status(400).json({ mensagem: "Orçamento deve ser maior que 0" })
    }

    const resultado = await pool.query(
      `INSERT INTO desafios (usuario_id, titulo, descricao, requisitos, linguagens, orcamento, expira_em) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [usuarioId, titulo, descricao, requisitos, linguagens, orcamento, expira_em],
    )

    res.status(201).json({ desafio: resultado.rows[0] })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao criar desafio" })
  }
})

// Editar desafio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { titulo, descricao } = req.body
    const usuarioId = req.usuario.id

    const desafioResultado = await pool.query("SELECT usuario_id FROM desafios WHERE id = $1", [id])

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" })
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ mensagem: "Sem permissão para editar este desafio" })
    }

    const resultado = await pool.query("UPDATE desafios SET titulo = $1, descricao = $2 WHERE id = $3 RETURNING *", [
      titulo,
      descricao,
      id,
    ])

    res.json({ desafio: resultado.rows[0] })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao editar desafio" })
  }
})

// Deletar desafio (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const usuarioId = req.usuario.id

    const desafioResultado = await pool.query("SELECT usuario_id FROM desafios WHERE id = $1", [id])

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" })
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ mensagem: "Sem permissão para deletar este desafio" })
    }

    await pool.query("UPDATE desafios SET status = $1, deletado_em = NOW() WHERE id = $2", ["deletado", id])

    res.json({ mensagem: "Desafio deletado com sucesso" })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao deletar desafio" })
  }
})

// Escolher vencedor
router.post("/:id/escolher-vencedor", async (req, res) => {
  try {
    const { id } = req.params
    const { propostaId } = req.body
    const usuarioId = req.usuario.id

    const desafioResultado = await pool.query("SELECT usuario_id FROM desafios WHERE id = $1", [id])

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" })
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ mensagem: "Sem permissão" })
    }

    await pool.query("UPDATE desafios SET vencedor_proposta_id = $1, status = $2 WHERE id = $3", [
      propostaId,
      "concluido",
      id,
    ])

    res.json({ mensagem: "Vencedor escolhido com sucesso" })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao escolher vencedor" })
  }
})

// Meus desafios
router.get("/meus-desafios", async (req, res) => {
  try {
    const usuarioId = req.usuario.id

    const resultado = await pool.query(
      "SELECT * FROM desafios WHERE usuario_id = $1 AND deletado_em IS NULL ORDER BY criado_em DESC",
      [usuarioId],
    )

    res.json({ desafios: resultado.rows })
  } catch (erro) {
    console.error(erro)
    res.status(500).json({ mensagem: "Erro ao listar seus desafios" })
  }
})

module.exports = router
