"use client";

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login } from "../services/auth";
import "../styles/global.css";

export default function Login() {
  const [credencial, setCredencial] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login: fazerLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const dados = await login(credencial, senha);
      fazerLogin(dados.usuario, dados.accessToken);
      localStorage.setItem("refreshToken", dados.refreshToken);

      if (dados.usuario.tipo === "admin") {
        navigate("/admin");
      } else if (dados.usuario.tipo === "contratante") {
        navigate("/dashboard-contratante");
      } else {
        navigate("/dashboard-proponente");
      }
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao fazer login");
      setCarregando(false);
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      {carregando && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "8px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px",
              }}
            />
            <p style={{ margin: 0, fontSize: "16px", color: "#333" }}>
              Entrando...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      )}

      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
            opacity: carregando ? 0.5 : 1,
            pointerEvents: carregando ? "none" : "auto",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "30px",
              fontSize: "28px",
            }}
          >
            Login
          </h1>

          {erro && (
            <div
              style={{
                backgroundColor: "#fee",
                color: "#c00",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Email ou Nome de Usuário
              </label>
              <input
                type="text"
                value={credencial}
                onChange={(e) => setCredencial(e.target.value)}
                required
                disabled={carregando}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="seu@email.com ou seu_usuario"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: carregando ? "not-allowed" : "pointer",
                opacity: carregando ? 0.7 : 1,
              }}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p
            style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}
          >
            Não tem conta?{" "}
            <Link
              to="/registro"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
