const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Testar conexão ao iniciar
pool.query("SELECT 1", (err, res) => {
  if (err) {
    console.error("[ERRO] Falha ao conectar no banco:", err);
  } else {
    console.log("[OK] Conexão com banco de dados estabelecida");
  }
});

module.exports = { pool };
