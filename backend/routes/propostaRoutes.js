const express = require("express");
const { pool } = require("../config/supabaseClient");
const { enviarEmail } = require("../config/email");

const router = express.Router();

// Enviar proposta
router.post("/", async (req, res) => {
  try {
    console.log("[v0] Recebendo proposta:", req.body);
    console.log("[v0] Usuario ID:", req.usuario?.id);

    const { desafio_id, valor, justificativa, prazo_estimado } = req.body;
    const usuarioId = req.usuario.id;

    if (!desafio_id || !valor || !justificativa || !prazo_estimado) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios",
      });
    }

    if (justificativa.length < 30 || justificativa.length > 2000) {
      return res.status(400).json({
        mensagem: "Justificativa deve ter entre 30 e 2000 caracteres",
      });
    }

    if (valor <= 0) {
      return res.status(400).json({ mensagem: "Valor deve ser maior que 0" });
    }

    // Verifica se já existe proposta
    const propostaExistente = await pool.query(
      "SELECT id FROM propostas WHERE desafio_id = $1 AND usuario_id = $2",
      [desafio_id, usuarioId]
    );

    if (propostaExistente.rows.length > 0) {
      return res
        .status(409)
        .json({ mensagem: "Você já enviou uma proposta para este desafio" });
    }

    const resultado = await pool.query(
      `INSERT INTO propostas (desafio_id, usuario_id, valor, justificativa, prazo_estimado) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [desafio_id, usuarioId, valor, justificativa, prazo_estimado]
    );

    const proposta = resultado.rows[0];
    console.log("[v0] Proposta criada com sucesso:", proposta.id);

    // Buscar contratante para enviar email
    const desafioResultado = await pool.query(
      "SELECT usuario_id FROM desafios WHERE id = $1",
      [desafio_id]
    );

    if (desafioResultado.rows.length > 0) {
      const contratanteId = desafioResultado.rows[0].usuario_id;
      const contratanteResultado = await pool.query(
        "SELECT email FROM usuarios WHERE id = $1",
        [contratanteId]
      );

      if (contratanteResultado.rows.length > 0) {
        try {
          await enviarEmail(
            contratanteResultado.rows[0].email,
            "Nova proposta recebida - ConectaDev",
            `<p>Você recebeu uma nova proposta por R$ ${valor}</p>`
          );
        } catch (emailError) {
          console.error("[v0] Erro ao enviar email:", emailError);
          // Não falha a requisição se o email falhar
        }
      }
    }

    res.status(201).json({ proposta });
  } catch (erro) {
    console.error("[v0] Erro ao enviar proposta:", erro);
    res
      .status(500)
      .json({ mensagem: "Erro ao enviar proposta: " + erro.message });
  }
});

// Editar proposta
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, justificativa, prazo_estimado } = req.body;
    const usuarioId = req.usuario.id;

    const propostaResultado = await pool.query(
      "SELECT usuario_id, atualizado_em FROM propostas WHERE id = $1",
      [id]
    );

    if (propostaResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Proposta não encontrada" });
    }

    const proposta = propostaResultado.rows[0];

    if (proposta.usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para editar esta proposta" });
    }

    // Verifica intervalo de 1 hora
    const ultimaAtualizacao = new Date(proposta.atualizado_em);
    const agora = new Date();
    const diferenca = (agora - ultimaAtualizacao) / (1000 * 60); // em minutos

    if (diferenca < 60) {
      return res.status(429).json({
        mensagem: "Você só pode editar sua proposta uma vez por hora",
      });
    }

    const resultado = await pool.query(
      `UPDATE propostas 
       SET valor = $1, justificativa = $2, prazo_estimado = $3, versao = versao + 1 
       WHERE id = $4 
       RETURNING *`,
      [valor, justificativa, prazo_estimado, id]
    );

    res.json({ proposta: resultado.rows[0] });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao editar proposta" });
  }
});

// Cancelar proposta
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const propostaResultado = await pool.query(
      "SELECT usuario_id FROM propostas WHERE id = $1",
      [id]
    );

    if (propostaResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Proposta não encontrada" });
    }

    if (propostaResultado.rows[0].usuario_id !== usuarioId) {
      return res
        .status(403)
        .json({ mensagem: "Sem permissão para deletar esta proposta" });
    }

    await pool.query("DELETE FROM propostas WHERE id = $1", [id]);

    res.json({ mensagem: "Proposta cancelada com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao cancelar proposta" });
  }
});

// Minhas propostas
router.get("/minhas-propostas", async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const resultado = await pool.query(
      `SELECT p.*, d.titulo, d.status as desafio_status 
       FROM propostas p 
       JOIN desafios d ON p.desafio_id = d.id 
       WHERE p.usuario_id = $1 
       ORDER BY p.criado_em DESC`,
      [usuarioId]
    );

    res.json({ propostas: resultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao listar suas propostas" });
  }
});

router.get("/desafio/:desafioId/menor", async (req, res) => {
  try {
    const { desafioId } = req.params;

    const resultado = await pool.query(
      "SELECT MIN(valor) as menor_valor FROM propostas WHERE desafio_id = $1",
      [desafioId]
    );

    res.json({ menorValor: resultado.rows[0].menor_valor });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar menor proposta" });
  }
});

module.exports = router;
