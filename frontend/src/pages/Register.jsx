"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cadastro } from "../services/auth";

export default function Register() {
  const [nome, setNome] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [tipo, setTipo] = useState("proponente");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erroNomeUsuario, setErroNomeUsuario] = useState("");
  const navigate = useNavigate();

  const validarSenha = (s) =>
    s.length >= 8 && /[a-zA-Z]/.test(s) && /[0-9]/.test(s);

  const validarNomeUsuario = (nome) => {
    const regex = /^[a-z0-9_.]*$/;
    if (nome.length === 0) {
      setErroNomeUsuario("");
      return true;
    }
    if (!regex.test(nome)) {
      setErroNomeUsuario(
        "Apenas letras minúsculas, números, ponto e underline"
      );
      return false;
    }
    if (nome.length < 3) {
      setErroNomeUsuario("Mínimo 3 caracteres");
      return false;
    }
    if (nome.length > 50) {
      setErroNomeUsuario("Máximo 50 caracteres");
      return false;
    }
    setErroNomeUsuario("");
    return true;
  };

  const handleNomeUsuarioChange = (e) => {
    const valor = e.target.value.toLowerCase();
    setNomeUsuario(valor);
    validarNomeUsuario(valor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }

    if (!validarSenha(senha)) {
      setErro("Senha deve ter mínimo 8 caracteres, letra e número");
      return;
    }

    if (!validarNomeUsuario(nomeUsuario)) {
      setErro("Nome de usuário inválido");
      return;
    }

    setCarregando(true);

    try {
      await cadastro(nome, email, senha, tipo, nomeUsuario);
      setSucesso("Cadastro realizado! Verifique seu email para confirmar.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao cadastrar");
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
              Cadastrando...
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
            Cadastro
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

          {sucesso && (
            <div
              style={{
                backgroundColor: "#efe",
                color: "#0a0",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              {sucesso}
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
                Nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={carregando}
                minLength="2"
                maxLength="100"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                placeholder="Seu nome"
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
                Nome de Usuário
              </label>
              <div style={{ position: "relative", marginBottom: "5px" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "10px",
                    color: "#666",
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  value={nomeUsuario}
                  onChange={handleNomeUsuarioChange}
                  required
                  disabled={carregando}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 30px",
                    border: erroNomeUsuario
                      ? "1px solid #c00"
                      : "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="fulano.dev"
                />
              </div>
              {erroNomeUsuario && (
                <small style={{ color: "#c00", fontSize: "12px" }}>
                  {erroNomeUsuario}
                </small>
              )}
              <small
                style={{
                  color: "#666",
                  fontSize: "12px",
                  display: "block",
                  marginTop: "5px",
                }}
              >
                Apenas minúsculas, números, ponto e underline
              </small>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="seu@email.com"
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
                Tipo de Usuário
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                disabled={carregando}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              >
                <option value="proponente">Desenvolvedor (Proponente)</option>
                <option value="contratante">Contratante</option>
              </select>
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
                placeholder="Mínimo 8 caracteres"
              />
              <small style={{ color: "#666", fontSize: "12px" }}>
                Mínimo 8 caracteres, letra e número
              </small>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                Confirmar Senha
              </label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
                placeholder="Confirme sua senha"
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
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p
            style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}
          >
            Já tem conta?{" "}
            <Link
              to="/login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Faça login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
