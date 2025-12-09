const express = require("express");
const { pool } = require("../config/supabaseClient");
const { enviarEmail } = require("../config/email");

const router = express.Router();

// Adicionar comentário
router.post("/", async (req, res) => {
  try {
    const { desafio_id, mensagem, comentario_pai_id } = req.body;
    const usuarioId = req.usuario.id;

    if (!mensagem || mensagem.trim().length === 0) {
      return res
        .status(400)
        .json({ mensagem: "Comentário não pode estar vazio" });
    }

    if (mensagem.length > 250) {
      return res
        .status(400)
        .json({ mensagem: "Comentário deve ter no máximo 250 caracteres" });
    }

    const desafioCheck = await pool.query(
      "SELECT status, expira_em FROM desafios WHERE id = $1",
      [desafio_id]
    );

    if (desafioCheck.rows.length === 0) {
      return res.status(404).json({ mensagem: "Desafio não encontrado" });
    }

    const desafio = desafioCheck.rows[0];
    const estaExpirado = new Date(desafio.expira_em) < new Date();

    if (desafio.status !== "ativo" || estaExpirado) {
      return res
        .status(400)
        .json({
          mensagem:
            "Não é possível comentar em desafios expirados ou concluídos",
        });
    }

    const resultado = await pool.query(
      "INSERT INTO comentarios (desafio_id, usuario_id, mensagem, comentario_pai_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [desafio_id, usuarioId, mensagem, comentario_pai_id || null]
    );

    if (!comentario_pai_id) {
      const desafioResultado = await pool.query(
        "SELECT usuario_id FROM desafios WHERE id = $1",
        [desafio_id]
      );
      const contratanteId = desafioResultado.rows[0].usuario_id;

      if (contratanteId !== usuarioId) {
        const contratanteResultado = await pool.query(
          "SELECT email FROM usuarios WHERE id = $1",
          [contratanteId]
        );
        if (contratanteResultado.rows.length > 0) {
          await enviarEmail(
            contratanteResultado.rows[0].email,
            "Novo comentário em seu desafio - ConectaDev",
            `<p>Alguém comentou em um de seus desafios</p>`
          );
        }
      }
    } else {
      const comentarioPaiResultado = await pool.query(
        "SELECT usuario_id FROM comentarios WHERE id = $1",
        [comentario_pai_id]
      );

      if (comentarioPaiResultado.rows.length > 0) {
        const autorPaiId = comentarioPaiResultado.rows[0].usuario_id;

        if (autorPaiId !== usuarioId) {
          const autorPaiDados = await pool.query(
            "SELECT email FROM usuarios WHERE id = $1",
            [autorPaiId]
          );
          if (autorPaiDados.rows.length > 0) {
            await enviarEmail(
              autorPaiDados.rows[0].email,
              "Alguém respondeu seu comentário - ConectaDev",
              `<p>Seu comentário recebeu uma resposta!</p>`
            );
          }
        }
      }
    }

    res.status(201).json({ comentario: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao adicionar comentário" });
  }
});

// Deletar comentário
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const comentarioResultado = await pool.query(
      "SELECT desafio_id FROM comentarios WHERE id = $1",
      [id]
    );

    if (comentarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Comentário não encontrado" });
    }

    const desafioId = comentarioResultado.rows[0].desafio_id;

    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [desafioId]
    );

    if (desafioResultado.rows[0].usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para deletar este comentário" });
    }

    await pool.query("DELETE FROM comentarios WHERE id = $1", [id]);

    res.json({ mensagem: "Comentário deletado com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao deletar comentário" });
  }
});

module.exports = router;
