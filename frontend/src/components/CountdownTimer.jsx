"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({
  expiraEm,
  onExpire,
  tamanho = "normal",
}) {
  const [tempoRestante, setTempoRestante] = useState(null);
  const [expirou, setExpirou] = useState(false);

  useEffect(() => {
    const calcularTempoRestante = () => {
      const agora = new Date().getTime();
      const expiracao = new Date(expiraEm).getTime();
      const diferenca = expiracao - agora;

      if (diferenca <= 0) {
        setExpirou(true);
        setTempoRestante(null);
        if (onExpire) onExpire();
        return;
      }

      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

      setTempoRestante({ minutos, segundos });
    };

    calcularTempoRestante();
    const intervalo = setInterval(calcularTempoRestante, 1000);

    return () => clearInterval(intervalo);
  }, [expiraEm, onExpire]);

  if (expirou) {
    return (
      <span
        style={{
          color: "#e74c3c",
          fontWeight: "600",
          fontSize: tamanho === "small" ? "12px" : "14px",
        }}
      >
        ⏱ Expirado
      </span>
    );
  }

  if (!tempoRestante) return null;

  const styles = {
    normal: {
      fontSize: "14px",
      padding: "6px 12px",
      backgroundColor: "#fff3cd",
      color: "#856404",
      borderRadius: "6px",
      fontWeight: "600",
      display: "inline-block",
    },
    small: {
      fontSize: "12px",
      color: "#856404",
      fontWeight: "600",
    },
  };

  return (
    <span style={styles[tamanho]}>
      ⏱ {tempoRestante.minutos}:
      {tempoRestante.segundos.toString().padStart(2, "0")}
    </span>
  );
}
