const express = require("express");
const { pool } = require("../config/supabaseClient");
const autenticar = require("../middleware/authMiddleware");

const router = express.Router();

// Listar desafios (feed)
router.get("/", async (req, res) => {
  try {
    await pool.query(
      `UPDATE desafios SET status = 'expirado' 
       WHERE status = 'ativo' AND expira_em < NOW()`
    );

    const resultado = await pool.query(
      `SELECT d.*, u.nome as usuario_nome, u.foto_perfil as usuario_foto, u.nome_usuario
       FROM desafios d 
       JOIN usuarios u ON d.usuario_id = u.id 
       WHERE d.deletado_em IS NULL 
       ORDER BY d.criado_em DESC`
    );

    res.json({ desafios: resultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao listar desafios" });
  }
});

// Obter detalhes de um desafio
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const desafioResultado = await pool.query(
      `SELECT d.*, u.nome as usuario_nome, u.foto_perfil as usuario_foto, u.nome_usuario,
       (SELECT MIN(valor) FROM propostas WHERE desafio_id = d.id) as menor_proposta,
       (SELECT COUNT(*) FROM propostas WHERE desafio_id = d.id) as total_propostas,
       (SELECT u2.nome FROM propostas p 
        JOIN usuarios u2 ON p.usuario_id = u2.id 
        WHERE p.id = d.vencedor_proposta_id) as vencedor_nome,
       (SELECT u2.foto_perfil FROM propostas p 
        JOIN usuarios u2 ON p.usuario_id = u2.id 
        WHERE p.id = d.vencedor_proposta_id) as vencedor_foto,
       (SELECT u2.id FROM propostas p 
        JOIN usuarios u2 ON p.usuario_id = u2.id 
        WHERE p.id = d.vencedor_proposta_id) as vencedor_id
       FROM desafios d 
       JOIN usuarios u ON d.usuario_id = u.id
       WHERE d.id = $1 AND d.deletado_em IS NULL`,
      [id]
    );

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    const comentariosResultado = await pool.query(
      `SELECT c.id, c.mensagem, c.criado_em, c.comentario_pai_id,
       u.nome as usuario_nome, u.foto_perfil as usuario_foto, u.id as usuario_id
       FROM comentarios c 
       JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.desafio_id = $1 
       ORDER BY c.comentario_pai_id NULLS FIRST, c.criado_em ASC`,
      [id]
    );

    const comentarios = comentariosResultado.rows.filter(
      (c) => !c.comentario_pai_id
    );
    const respostas = comentariosResultado.rows.filter(
      (c) => c.comentario_pai_id
    );

    comentarios.forEach((comentario) => {
      comentario.respostas = respostas.filter(
        (r) => r.comentario_pai_id === comentario.id
      );
    });

    res.json({
      desafio: desafioResultado.rows[0],
      comentarios: comentarios,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao obter desafio" });
  }
});

// Criar desafio
router.post("/", async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      requisitos,
      caracteristicas,
      orcamento,
      expira_em,
      minutos_expiracao,
    } = req.body;
    const usuarioId = req.usuario.id;

    if (!titulo || titulo.length > 50) {
      return res
        .status(400)
        .json({ mensagem: "Título deve ter no máximo 50 caracteres" });
    }

    if (!descricao || descricao.length > 1000) {
      return res
        .status(400)
        .json({ mensagem: "Descrição deve ter no máximo 1000 caracteres" });
    }

    if (!requisitos || requisitos.length > 500) {
      return res
        .status(400)
        .json({ mensagem: "Requisitos deve ter no máximo 500 caracteres" });
    }

    if (orcamento <= 0) {
      return res
        .status(400)
        .json({ mensagem: "Orçamento deve ser maior que 0" });
    }

    const resultado = await pool.query(
      `INSERT INTO desafios (usuario_id, titulo, descricao, requisitos, caracteristicas, orcamento, expira_em, minutos_expiracao) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        usuarioId,
        titulo,
        descricao,
        requisitos,
        caracteristicas,
        orcamento,
        expira_em,
        minutos_expiracao,
      ]
    );

    res.status(201).json({ desafio: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao criar desafio" });
  }
});

// Editar desafio
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    const usuarioId = req.usuario.id;

    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [id]
    );

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para editar este desafio" });
    }

    const resultado = await pool.query(
      "UPDATE desafios SET titulo = $1, descricao = $2 WHERE id = $3 RETURNING *",
      [titulo, descricao, id]
    );

    res.json({ desafio: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao editar desafio" });
  }
});

// Deletar desafio (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [id]
    );

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para deletar este desafio" });
    }

    await pool.query(
      "UPDATE desafios SET status = $1, deletado_em = NOW() WHERE id = $2",
      ["deletado", id]
    );

    res.json({ mensagem: "Desafio deletado com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao deletar desafio" });
  }
});

// Escolher vencedor
router.post("/:id/escolher-vencedor", async (req, res) => {
  try {
    const { id } = req.params;
    const { propostaId } = req.body;
    const usuarioId = req.usuario.id;

    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [id]
    );

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res.status(403).json({ mensagem: "Sem permissão" });
    }

    await pool.query(
      "UPDATE desafios SET vencedor_proposta_id = $1, status = $2 WHERE id = $3",
      [propostaId, "concluido", id]
    );

    res.json({ mensagem: "Vencedor escolhido com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao escolher vencedor" });
  }
});

// Listar meus desafios
router.get("/meus-desafios", autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      "SELECT * FROM desafios WHERE usuario_id = $1 AND deletado_em IS NULL ORDER BY criado_em DESC",
      [usuarioId]
    );

    res.json({ desafios: resultado.rows });
  } catch (erro) {
    console.error("[v0] Erro ao listar desafios:", erro);
    res.status(500).json({ mensagem: "Erro ao listar seus desafios" });
  }
});

router.get("/:id/propostas", async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    // Verificar se é o dono do desafio
    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [id]
    );

    if (desafioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para ver as propostas" });
    }

    const resultado = await pool.query(
      `SELECT p.*, u.nome as usuario_nome, u.foto_perfil as usuario_foto, u.id as usuario_id
       FROM propostas p
       JOIN usuarios u ON p.usuario_id = u.id
       WHERE p.desafio_id = $1
       ORDER BY p.valor ASC`,
      [id]
    );

    res.json({ propostas: resultado.rows });
  } catch (erro) {
    console.error("[v0] Erro ao listar propostas:", erro);
    res.status(500).json({ mensagem: "Erro ao listar propostas" });
  }
});

module.exports = router;
