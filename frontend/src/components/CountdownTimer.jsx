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
      const agora = new Date();
      const expiracao = new Date(expiraEm);
      const diferencaMs = expiracao.getTime() - agora.getTime();
      const diferencaSegundos = Math.floor(diferencaMs / 1000);

      if (diferencaSegundos <= 0) {
        if (!expirou) {
          setExpirou(true);
          setTempoRestante(null);
          if (onExpire) onExpire();
        }
        return;
      }

      const horas = Math.floor(diferencaSegundos / 3600);
      const minutos = Math.floor((diferencaSegundos % 3600) / 60);
      const segundos = diferencaSegundos % 60;

      setTempoRestante({ horas, minutos, segundos });
    };

    calcularTempoRestante();
    const intervalo = setInterval(calcularTempoRestante, 1000);

    return () => clearInterval(intervalo);
  }, [expiraEm, onExpire, expirou]);

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

  const formatarTempo = () => {
    const totalMinutos = tempoRestante.horas * 60 + tempoRestante.minutos;
    const segundos = tempoRestante.segundos;
    return `⏱ ${totalMinutos}m ${segundos.toString().padStart(2, "0")}s`;
  };

  return <span style={styles[tamanho]}>{formatarTempo()}</span>;
}
