const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number.parseInt(process.env.EMAIL_PORT),
  secure: false, // Alterado de true para false (TLS na porta 587)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarEmail = async (para, assunto, html) => {
  try {
    console.log(`[EMAIL] Enviando para ${para}`);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: para,
      subject: assunto,
      html,
    });
    console.log(`[OK] Email enviado para ${para}`);
  } catch (erro) {
    console.error("[ERRO] Falha ao enviar email:", erro.message);
    // Não para a requisição se email falhar
  }
};

module.exports = { enviarEmail, transporter };
