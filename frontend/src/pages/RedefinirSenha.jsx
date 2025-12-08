"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { redefinirSenha } from "../services/auth";
import "../styles/RedefinirSenha.css";

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setTipo("erro");
      setMensagem("Token não encontrado. Link inválido.");
      setToken(null);
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validarSenha = (senha) => {
    if (senha.length < 8) return "Senha deve ter mínimo 8 caracteres";
    if (!/[a-zA-Z]/.test(senha)) return "Senha deve conter letras";
    if (!/[0-9]/.test(senha)) return "Senha deve conter números";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");

    if (!token) {
      setTipo("erro");
      setMensagem("Token inválido ou expirado");
      return;
    }

    const validacao = validarSenha(novaSenha);
    if (validacao) {
      setTipo("erro");
      setMensagem(validacao);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setTipo("erro");
      setMensagem("As senhas não conferem");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await redefinirSenha(token, novaSenha);
      setTipo("sucesso");
      setMensagem(resposta.mensagem || "Senha redefinida com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (erro) {
      setTipo("erro");
      setMensagem(
        erro.response?.data?.mensagem ||
          "Erro ao redefinir senha. Token inválido ou expirado."
      );
    } finally {
      setCarregando(false);
    }
  };

  if (!token) {
    return (
      <div className="redefinir-container">
        <div className="redefinir-card">
          <h1>Erro</h1>
          <div className="mensagem erro">{mensagem}</div>
          <button onClick={() => navigate("/login")} className="btn-voltar">
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="redefinir-container">
      <div className="redefinir-card">
        <h1>Redefinir Senha</h1>
        <p>Digite sua nova senha</p>

        {mensagem && <div className={`mensagem ${tipo}`}>{mensagem}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha (mín. 8 caracteres, letras e números)"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
            disabled={carregando}
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            disabled={carregando}
          />
          <button type="submit" disabled={carregando}>
            {carregando ? "Redefinindo..." : "Redefinir Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
