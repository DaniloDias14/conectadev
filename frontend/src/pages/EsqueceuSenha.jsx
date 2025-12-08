"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { esqueceuSenha } from "../services/auth";
import "../styles/EsqueceuSenha.css";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const resposta = await esqueceuSenha(email);
      setTipo("sucesso");
      setMensagem(
        resposta.mensagem ||
          "Se o email existe, você receberá instruções de recuperação"
      );
      setEmail("");
    } catch (erro) {
      setTipo("erro");
      setMensagem(
        erro.response?.data?.mensagem ||
          "Erro ao solicitar recuperação de senha"
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="esqueceu-container">
      <div className="esqueceu-card">
        <h1>Recuperar Senha</h1>
        <p>Digite seu email para receber instruções de recuperação</p>

        {mensagem && <div className={`mensagem ${tipo}`}>{mensagem}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={carregando}
          />
          <button type="submit" disabled={carregando}>
            {carregando ? "Enviando..." : "Enviar Instruções"}
          </button>
        </form>

        <p className="voltar-link">
          Lembrou a senha?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="link-btn"
          >
            Voltar para login
          </button>
        </p>
      </div>
    </div>
  );
}
