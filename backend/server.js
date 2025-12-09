const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const desafioRoutes = require("./routes/desafioRoutes");
const propostaRoutes = require("./routes/propostaRoutes");
const comentarioRoutes = require("./routes/comentarioRoutes");
const perfilRoutes = require("./routes/perfilRoutes");
const adminRoutes = require("./routes/adminRoutes");
const assinaturaRoutes = require("./routes/assinaturaRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  "/fotos_usuarios",
  express.static(path.join(__dirname, "../public/fotos_usuarios"))
);
app.use(
  "/curriculos",
  express.static(path.join(__dirname, "../public/curriculos"))
);

// Rotas públicas
app.use("/api/auth", authRoutes);

// Rotas protegidas
app.use(authMiddleware);
app.use("/api/desafios", desafioRoutes);
app.use("/api/propostas", propostaRoutes);
app.use("/api/comentarios", comentarioRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/assinaturas", assinaturaRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    mensagem: err.message || "Erro interno do servidor",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
