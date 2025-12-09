const express = require("express");
const { pool } = require("../config/supabaseClient");
const autenticar = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const Busboy = require("busboy");

const router = express.Router();

const parseFormData = (req) => {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });
    const fields = {};
    const files = {};

    bb.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on("file", (fieldname, file, info) => {
      const chunks = [];
      file.on("data", (data) => {
        chunks.push(data);
      });
      file.on("end", () => {
        files[fieldname] = {
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          encoding: info.encoding,
          mimeType: info.mimeType,
        };
      });
    });

    bb.on("close", () => {
      resolve({ fields, files });
    });

    bb.on("error", reject);

    req.pipe(bb);
  });
};

router.get("/busca/usuarios", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 1) {
      return res.json({ usuarios: [] });
    }

    const busca = q.toLowerCase().replace(/^@/, "");

    const resultado = await pool.query(
      "SELECT id, nome, tipo, foto_perfil, nome_usuario FROM usuarios WHERE LOWER(nome) ILIKE $1 OR LOWER(nome_usuario) ILIKE $2 LIMIT 10",
      [`%${busca}%`, `%${busca}%`]
    );

    res.json({ usuarios: resultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao buscar usuários" });
  }
});

router.get("/:nomeUsuario", async (req, res) => {
  try {
    const { nomeUsuario } = req.params;

    if (!nomeUsuario) {
      return res
        .status(400)
        .json({ mensagem: "Nome de usuário é obrigatório" });
    }

    let resultado = await pool.query(
      "SELECT id, nome, email, tipo, bio, telefone, foto_perfil, curriculo_pdf, criado_em, nome_usuario FROM usuarios WHERE LOWER(nome_usuario) = LOWER($1)",
      [nomeUsuario]
    );

    if (resultado.rows.length === 0) {
      resultado = await pool.query(
        "SELECT id, nome, email, tipo, bio, telefone, foto_perfil, curriculo_pdf, criado_em, nome_usuario FROM usuarios WHERE LOWER(nome) = LOWER($1)",
        [nomeUsuario]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const usuario = resultado.rows[0];

    res.json({ usuario });
  } catch (erro) {
    console.error("[v0] Erro ao obter perfil:", erro);
    res.status(500).json({ mensagem: "Erro ao obter perfil" });
  }
});

router.put("/", autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const { fields, files } = await parseFormData(req);
    const { nome, bio, telefone } = fields;

    // Obter usuário atual para deletar arquivos antigos
    const usuarioAtual = await pool.query(
      "SELECT foto_perfil, curriculo_pdf FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    const usuarioData = usuarioAtual.rows[0];

    let fotoPerfilPath = usuarioData?.foto_perfil;
    let curriculoPath = usuarioData?.curriculo_pdf;

    if (files.foto_perfil) {
      const fotoDir = path.join(__dirname, "../../public/fotos_usuarios");
      if (!fs.existsSync(fotoDir)) {
        fs.mkdirSync(fotoDir, { recursive: true });
      }

      // Deletar foto antiga se existir
      if (fotoPerfilPath) {
        const caminhoFotoAntiga = path.join(__dirname, "../..", fotoPerfilPath);
        if (fs.existsSync(caminhoFotoAntiga)) {
          fs.unlinkSync(caminhoFotoAntiga);
        }
      }

      // Salvar nova foto
      const timestamp = Date.now();
      const extensao = files.foto_perfil.filename.split(".").pop();
      const nomeArquivo = `foto_${usuarioId}_${timestamp}.${extensao}`;
      const caminhoCompleto = path.join(fotoDir, nomeArquivo);

      fs.writeFileSync(caminhoCompleto, files.foto_perfil.buffer);
      fotoPerfilPath = `public/fotos_usuarios/${nomeArquivo}`;
    }

    if (files.curriculo_pdf) {
      if (files.curriculo_pdf.mimeType !== "application/pdf") {
        return res
          .status(400)
          .json({ mensagem: "O currículo deve ser um arquivo PDF" });
      }

      if (files.curriculo_pdf.buffer.length > 10 * 1024 * 1024) {
        return res
          .status(400)
          .json({ mensagem: "O currículo não pode exceder 10MB" });
      }

      const curricDir = path.join(__dirname, "../../public/curriculos");
      if (!fs.existsSync(curricDir)) {
        fs.mkdirSync(curricDir, { recursive: true });
      }

      // Deletar currículo antigo se existir
      if (curriculoPath) {
        const caminhoCurricAntigo = path.join(
          __dirname,
          "../..",
          curriculoPath
        );
        if (fs.existsSync(caminhoCurricAntigo)) {
          fs.unlinkSync(caminhoCurricAntigo);
        }
      }

      // Salvar novo currículo
      const timestamp = Date.now();
      const nomeArquivo = `curriculo_${usuarioId}_${timestamp}.pdf`;
      const caminhoCompleto = path.join(curricDir, nomeArquivo);

      fs.writeFileSync(caminhoCompleto, files.curriculo_pdf.buffer);
      curriculoPath = `public/curriculos/${nomeArquivo}`;
    }

    // Atualizar banco de dados
    const resultado = await pool.query(
      `UPDATE usuarios 
       SET bio = COALESCE($1, bio), 
           telefone = COALESCE($2, telefone), 
           nome = COALESCE($3, nome),
           foto_perfil = COALESCE($4, foto_perfil),
           curriculo_pdf = COALESCE($5, curriculo_pdf)
       WHERE id = $6 
       RETURNING id, nome, email, tipo, bio, telefone, foto_perfil, curriculo_pdf, criado_em, nome_usuario`,
      [
        bio || null,
        telefone || null,
        nome || null,
        fotoPerfilPath,
        curriculoPath,
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
    console.error("[v0] Erro ao atualizar perfil:", erro);
    res
      .status(500)
      .json({ mensagem: "Erro ao atualizar perfil: " + erro.message });
  }
});

router.delete("/foto", autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Obter caminho da foto atual
    const usuarioAtual = await pool.query(
      "SELECT foto_perfil FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    const fotoAtual = usuarioAtual.rows[0]?.foto_perfil;

    // Deletar arquivo físico se existir
    if (fotoAtual) {
      const caminhoFoto = path.join(__dirname, "../..", fotoAtual);
      if (fs.existsSync(caminhoFoto)) {
        fs.unlinkSync(caminhoFoto);
      }
    }

    // Atualizar banco removendo foto_perfil
    await pool.query("UPDATE usuarios SET foto_perfil = NULL WHERE id = $1", [
      usuarioId,
    ]);

    res.json({ mensagem: "Foto removida com sucesso" });
  } catch (erro) {
    console.error("Erro ao remover foto:", erro);
    res.status(500).json({ mensagem: "Erro ao remover foto" });
  }
});

router.get("/:nomeUsuario/desafios", async (req, res) => {
  try {
    const { nomeUsuario } = req.params;

    const usuarioResultado = await pool.query(
      "SELECT id FROM usuarios WHERE LOWER(nome_usuario) = LOWER($1)",
      [nomeUsuario]
    );

    if (usuarioResultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Usuário não encontrado" });
    }

    const usuarioId = usuarioResultado.rows[0].id;

    await pool.query(
      `UPDATE desafios SET status = 'expirado' 
       WHERE status = 'ativo' AND expira_em < NOW()`
    );

    const desafiosResultado = await pool.query(
      "SELECT * FROM desafios WHERE usuario_id = $1 AND deletado_em IS NULL ORDER BY criado_em DESC",
      [usuarioId]
    );

    res.json({ desafios: desafiosResultado.rows });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao obter desafios" });
  }
});

module.exports = router;
