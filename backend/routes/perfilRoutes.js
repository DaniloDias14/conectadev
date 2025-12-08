const express = require("express");
const { pool } = require("../config/supabaseClient");
const autenticar = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:nomeUsuario", async (req, res) => {
  try {
    const { nomeUsuario } = req.params;

    const resultado = await pool.query(
      "SELECT id, nome, email, tipo, bio, telefone, foto_perfil, curriculo_pdf, criado_em, nome_usuario FROM usuarios WHERE nome_usuario = $1",
      [nomeUsuario.toLowerCase()]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const usuario = resultado.rows[0];

    res.json({ usuario });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao obter perfil" });
  }
});

router.get("/busca/usuarios", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.json({ usuarios: [] });
    }

    // Limpar o @ se o usuário digitou
    const busca = q.toLowerCase().replace(/^@/, "");

    const resultado = await pool.query(
      "SELECT id, nome, tipo, foto_perfil, nome_usuario FROM usuarios WHERE LOWER(nome) ILIKE $1 OR LOWER(nome_usuario) ILIKE $2 LIMIT 10",
      [`${busca}%`, `${busca}%`]
    );

    res.json({ usuarios: resultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuários" });
  }
});

// Atualizar próprio perfil (requer autenticação)
router.put("/", autenticar, async (req, res) => {
  try {
    const { nome, bio, telefone, curriculo_pdf, nomeUsuario } = req.body;
    const usuarioId = req.usuario.id;

    if (nomeUsuario) {
      const regex = /^[a-z0-9_.]+$/;
      if (
        !regex.test(nomeUsuario) ||
        nomeUsuario.length < 3 ||
        nomeUsuario.length > 50
      ) {
        return res.status(400).json({ mensagem: "Nome de usuário inválido" });
      }

      const nomeUsuarioExistente = await pool.query(
        "SELECT id FROM usuarios WHERE nome_usuario = $1 AND id != $2",
        [nomeUsuario.toLowerCase(), usuarioId]
      );
      if (nomeUsuarioExistente.rows.length > 0) {
        return res
          .status(409)
          .json({ mensagem: "Nome de usuário já está em uso" });
      }
    }

    if (nome) {
      const nomeExistente = await pool.query(
        "SELECT id FROM usuarios WHERE nome = $1 AND id != $2",
        [nome, usuarioId]
      );
      if (nomeExistente.rows.length > 0) {
        return res.status(409).json({ mensagem: "Nome já está em uso" });
      }
    }

    const resultado = await pool.query(
      "UPDATE usuarios SET nome = COALESCE($1, nome), bio = COALESCE($2, bio), telefone = COALESCE($3, telefone), curriculo_pdf = COALESCE($4, curriculo_pdf), nome_usuario = COALESCE($5, nome_usuario) WHERE id = $6 RETURNING id, nome, email, tipo, bio, telefone, foto_perfil, curriculo_pdf, criado_em, nome_usuario",
      [
        nome || null,
        bio || null,
        telefone || null,
        curriculo_pdf || null,
        nomeUsuario ? nomeUsuario.toLowerCase() : null,
        usuarioId,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    res.json({
      mensagem: "Perfil atualizado com sucesso",
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    console.error(erro);
    res
      .status(500)
      .json({ mensagem: "Erro ao atualizar perfil: " + erro.message });
  }
});

router.get("/:nomeUsuario/desafios", async (req, res) => {
  try {
    const { nomeUsuario } = req.params;

    const usuarioResultado = await pool.query(
      "SELECT id FROM usuarios WHERE nome_usuario = $1 AND tipo = $2",
      [nomeUsuario.toLowerCase(), "contratante"]
    );

    if (usuarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Contratante não encontrado" });
    }

    const usuarioId = usuarioResultado.rows[0].id;

    const desafiosResultado = await pool.query(
      "SELECT * FROM desafios WHERE usuario_id = $1 ORDER BY criado_em DESC",
      [usuarioId]
    );

    res.json({ desafios: desafiosResultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao obter desafios" });
  }
});

module.exports = router;
