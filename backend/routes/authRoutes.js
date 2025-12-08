const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/supabaseClient");
const {
  gerarAccessToken,
  gerarRefreshToken,
  verificarRefreshToken,
} = require("../config/jwt");
const { enviarEmail } = require("../config/email");

const router = express.Router();

const validarNomeUsuario = (nome) => {
  const regex = /^[a-z0-9_.]+$/;
  return regex.test(nome) && nome.length >= 3 && nome.length <= 50;
};

// Registro
router.post("/registro", async (req, res) => {
  try {
    console.log("[REGISTRO] Dados recebidos:", {
      nome: req.body.nome,
      email: req.body.email,
      tipo: req.body.tipo,
    });

    const { nome, email, senha, tipo, nomeUsuario } = req.body;

    if (!nome || nome.length < 2 || nome.length > 100) {
      return res.status(400).json({ mensagem: "Nome inválido" });
    }

    if (!nomeUsuario || !validarNomeUsuario(nomeUsuario)) {
      return res.status(400).json({
        mensagem:
          "Nome de usuário inválido. Apenas minúsculas, números, ponto e underline (mínimo 3 caracteres)",
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ mensagem: "Email inválido" });
    }

    if (
      !senha ||
      senha.length < 8 ||
      !/[a-zA-Z]/.test(senha) ||
      !/[0-9]/.test(senha)
    ) {
      return res.status(400).json({
        mensagem: "Senha deve ter mínimo 8 caracteres, letra e número",
      });
    }

    if (!["proponente", "contratante", "admin"].includes(tipo)) {
      return res.status(400).json({ mensagem: "Tipo de usuário inválido" });
    }

    // Verifica se email já existe
    const usuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({ mensagem: "Email já cadastrado" });
    }

    const nomeUsuarioExistente = await pool.query(
      "SELECT id FROM usuarios WHERE nome_usuario = $1",
      [nomeUsuario.toLowerCase()]
    );

    if (nomeUsuarioExistente.rows.length > 0) {
      return res
        .status(409)
        .json({ mensagem: "Nome de usuário já está em uso" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    const resultado = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash, tipo, nome_usuario, verificado) VALUES ($1, $2, $3, $4, $5, false) RETURNING id, nome, email, tipo, nome_usuario",
      [nome, email, senhaHash, tipo, nomeUsuario.toLowerCase()]
    );

    const usuario = resultado.rows[0];
    console.log("[REGISTRO] Usuário criado com ID:", usuario.id);

    // Gerar token de verificação
    const tokenVerificacao = crypto.randomBytes(32).toString("hex");
    const expiracao = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await pool.query(
      "INSERT INTO tokens_email (usuario_id, token, tipo, expira_em) VALUES ($1, $2, $3, $4)",
      [usuario.id, tokenVerificacao, "verificacao", expiracao]
    );

    // Enviar email
    const linkVerificacao = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/verificar-email?token=${tokenVerificacao}`;
    await enviarEmail(
      email,
      "Verifique seu email - ConectaDev",
      `<p>Clique no link abaixo para verificar sua conta:</p><a href="${linkVerificacao}">${linkVerificacao}</a>`
    );

    console.log("[REGISTRO] Cadastro completo para:", email);
    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso! Verifique seu email.",
      usuario,
    });
  } catch (erro) {
    console.error("[ERRO REGISTRO]", erro.message, erro.code);
    res
      .status(500)
      .json({ mensagem: "Erro ao registrar usuário: " + erro.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { credencial, senha } = req.body;

    if (!credencial || !senha) {
      return res
        .status(400)
        .json({ mensagem: "Email/usuário e senha são obrigatórios" });
    }

    // Detectar se é email ou nome_usuario
    const ehEmail = credencial.includes("@");

    let resultado;
    if (ehEmail) {
      resultado = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
        credencial,
      ]);
    } else {
      resultado = await pool.query(
        "SELECT * FROM usuarios WHERE nome_usuario = $1",
        [credencial.toLowerCase()]
      );
    }

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos" });
    }

    const usuario = resultado.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ mensagem: "Email ou senha incorretos" });
    }

    if (!usuario.verificado) {
      return res
        .status(403)
        .json({ mensagem: "Por favor, verifique seu email primeiro" });
    }

    // Gerar tokens
    const accessToken = gerarAccessToken(usuario.id, usuario.tipo);
    const refreshToken = gerarRefreshToken(usuario.id);

    // Enviar email de login
    const agora = new Date().toLocaleString("pt-BR");
    await enviarEmail(
      usuario.email,
      "Login realizado - ConectaDev",
      `<p>Você fez login em sua conta ConectaDev às ${agora}</p>`
    );

    res.json({
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
        nome_usuario: usuario.nome_usuario,
      },
      accessToken,
      refreshToken,
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao fazer login" });
  }
});

// Verificar email
router.post("/verificar-email", async (req, res) => {
  try {
    const { token } = req.body;

    const resultado = await pool.query(
      "SELECT usuario_id FROM tokens_email WHERE token = $1 AND tipo = $2 AND expira_em > NOW()",
      [token, "verificacao"]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ mensagem: "Token inválido ou expirado" });
    }

    const usuarioId = resultado.rows[0].usuario_id;

    await pool.query("UPDATE usuarios SET verificado = true WHERE id = $1", [
      usuarioId,
    ]);
    await pool.query(
      "DELETE FROM tokens_email WHERE usuario_id = $1 AND tipo = $2",
      [usuarioId, "verificacao"]
    );

    res.json({ mensagem: "Email verificado com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao verificar email" });
  }
});

// Refresh Token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ mensagem: "Refresh token obrigatório" });
    }

    const payload = verificarRefreshToken(refreshToken);
    if (!payload) {
      return res
        .status(401)
        .json({ mensagem: "Refresh token inválido ou expirado" });
    }

    const resultado = await pool.query(
      "SELECT id, tipo FROM usuarios WHERE id = $1",
      [payload.id]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ mensagem: "Usuário não encontrado" });
    }

    const usuario = resultado.rows[0];
    const novoAccessToken = gerarAccessToken(usuario.id, usuario.tipo);

    res.json({ accessToken: novoAccessToken });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao renovar token" });
  }
});

// Esqueceu senha
router.post("/esqueceu-senha", async (req, res) => {
  try {
    const { email } = req.body;

    const resultado = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.json({
        mensagem: "Se o email existe, você receberá instruções de recuperação",
      });
    }

    const usuarioId = resultado.rows[0].id;
    const tokenRecuperacao = crypto.randomBytes(32).toString("hex");
    const expiracao = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await pool.query(
      "INSERT INTO tokens_email (usuario_id, token, tipo, expira_em) VALUES ($1, $2, $3, $4)",
      [usuarioId, tokenRecuperacao, "recuperacao", expiracao]
    );

    const linkRecuperacao = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/redefinir-senha?token=${tokenRecuperacao}`;
    await enviarEmail(
      email,
      "Recuperar senha - ConectaDev",
      `<p>Clique no link abaixo para redefinir sua senha:</p><a href="${linkRecuperacao}">${linkRecuperacao}</a>`
    );

    res.json({
      mensagem: "Se o email existe, você receberá instruções de recuperação",
    });
  } catch (erro) {
    console.error(erro);
    res
      .status(500)
      .json({ mensagem: "Erro ao solicitar recuperação de senha" });
  }
});

// Redefinir senha
router.post("/redefinir-senha", async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (
      !novaSenha ||
      novaSenha.length < 8 ||
      !/[a-zA-Z]/.test(novaSenha) ||
      !/[0-9]/.test(novaSenha)
    ) {
      return res.status(400).json({
        mensagem: "Senha deve ter mínimo 8 caracteres, letra e número",
      });
    }

    const resultado = await pool.query(
      "SELECT usuario_id FROM tokens_email WHERE token = $1 AND tipo = $2 AND expira_em > NOW()",
      [token, "recuperacao"]
    );

    if (resultado.rows.length === 0) {
      return res.status(400).json({ mensagem: "Token inválido ou expirado" });
    }

    const usuarioId = resultado.rows[0].usuario_id;
    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await pool.query("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [
      senhaHash,
      usuarioId,
    ]);
    await pool.query("DELETE FROM tokens_email WHERE usuario_id = $1", [
      usuarioId,
    ]);

    const emailResultado = await pool.query(
      "SELECT email FROM usuarios WHERE id = $1",
      [usuarioId]
    );
    await enviarEmail(
      emailResultado.rows[0].email,
      "Senha redefinida - ConectaDev",
      "<p>Sua senha foi redefinida com sucesso!</p>"
    );

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao redefinir senha" });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  try {
    res.json({ mensagem: "Logout realizado com sucesso" });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro ao fazer logout" });
  }
});

module.exports = router;
