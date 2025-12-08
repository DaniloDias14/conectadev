"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verificarEmail } from "../services/auth";
import "../styles/VerifyEmail.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verificando"); // verificando, sucesso, erro
  const [mensagem, setMensagem] = useState("Verificando seu email...");

  useEffect(() => {
    const verificar = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("erro");
        setMensagem("Token não encontrado. Verifique o link do email.");
        return;
      }

      try {
        const resposta = await verificarEmail(token);
        setStatus("sucesso");
        setMensagem(resposta.mensagem || "Email verificado com sucesso!");

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (erro) {
        setStatus("erro");
        setMensagem(
          erro.response?.data?.mensagem ||
            "Erro ao verificar email. Token inválido ou expirado."
        );
      }
    };

    verificar();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        {status === "verificando" && <div className="spinner"></div>}

        {status === "sucesso" && <div className="success-icon">✓</div>}

        {status === "erro" && <div className="error-icon">✕</div>}

        <h1>
          {status === "verificando"
            ? "Verificando..."
            : status === "sucesso"
            ? "Verificado!"
            : "Erro na Verificação"}
        </h1>

        <p>{mensagem}</p>

        {status === "sucesso" && (
          <p className="redirect-text">
            Redirecionando para login em 3 segundos...
          </p>
        )}

        {status === "erro" && (
          <button onClick={() => navigate("/login")} className="btn-voltar">
            Voltar para Login
          </button>
        )}
      </div>
    </div>
  );
}
