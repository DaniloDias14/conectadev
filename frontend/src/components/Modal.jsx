"use client";

import { useState } from "react";
import api from "../services/api";

export default function Modal({ desafioId, onClose, fecharModal }) {
  const [valor, setValor] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [prazo, setPrazo] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const formatarValorReais = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    if (!numeros) return "";

    const numero = Number(numeros) / 100;
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleValorChange = (e) => {
    const valorFormatado = formatarValorReais(e.target.value);
    setValor(valorFormatado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    if (!justificativa.trim()) {
      setErro("Justificativa é obrigatória");
      setCarregando(false);
      return;
    }

    if (justificativa.length > 500) {
      setErro("Justificativa deve ter no máximo 500 caracteres");
      setCarregando(false);
      return;
    }

    try {
      const valorNumerico = Number(valor.replace(/\./g, "").replace(",", "."));

      await api.post("/propostas", {
        desafio_id: desafioId,
        valor: valorNumerico,
        justificativa,
        prazo_estimado: Number.parseInt(prazo),
      });

      if (typeof fecharModal === "function") {
        fecharModal();
      }
    } catch (err) {
      console.error("Erro ao enviar proposta:", err);
      setErro(err.response?.data?.mensagem || "Erro ao enviar proposta");
      setCarregando(false);
    }
  };

  const handleClose = () => {
    if (typeof fecharModal === "function") {
      fecharModal();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0 }}>Enviar Proposta</h2>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        {erro && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c00",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "20px",
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
              Valor (R$) *
            </label>
            <input
              type="text"
              value={valor}
              onChange={handleValorChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="0,00"
            />
            <small
              style={{ color: "#666", display: "block", marginTop: "4px" }}
            >
              Digite apenas números, a formatação é automática
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
              Justificativa *
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setJustificativa(e.target.value);
                }
              }}
              required
              maxLength="500"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                minHeight: "100px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
              placeholder="Por que você é o melhor para este desafio?"
            />
            <small
              style={{
                color: justificativa.length === 500 ? "#e74c3c" : "#666",
                display: "block",
                marginTop: "4px",
              }}
            >
              {justificativa.length}/500 caracteres{" "}
              {justificativa.length === 500 && "- Limite atingido"}
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
              Prazo Estimado (dias) *
            </label>
            <input
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              required
              min="1"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="7"
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={carregando}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: carregando ? "not-allowed" : "pointer",
                fontWeight: "bold",
                opacity: carregando ? 0.7 : 1,
              }}
            >
              {carregando ? "Enviando..." : "Enviar Proposta"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
