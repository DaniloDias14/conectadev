"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import CountdownTimer from "./CountdownTimer";

export default function CardDesafio({ desafio }) {
  const navigate = useNavigate();
  const [empresa, setEmpresa] = useState(null);
  const [menorProposta, setMenorProposta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desafioExpirado, setDesafioExpirado] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [empresaRes, propostasRes] = await Promise.all([
          api.get(`/perfil/${desafio.usuario_id}`),
          api.get(`/propostas/desafio/${desafio.id}/menor`),
        ]);

        setEmpresa(empresaRes.data.usuario);
        if (propostasRes.data.menorValor) {
          setMenorProposta(propostasRes.data.menorValor);
        }
      } catch (err) {
        console.error("[v0] Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [desafio.usuario_id, desafio.id]);

  const estaExpirado =
    new Date(desafio.expira_em) < new Date() || desafioExpirado;
  const estaAtivo = desafio.status === "ativo" && !estaExpirado;

  let caracteristicas = [];
  try {
    caracteristicas = JSON.parse(desafio.caracteristicas || "[]");
  } catch (e) {
    caracteristicas = desafio.caracteristicas ? [desafio.caracteristicas] : [];
  }

  const handleClickEmpresa = (e) => {
    e.stopPropagation();
    navigate(`/perfil/${desafio.usuario_id}`);
  };

  return (
    <div
      onClick={() => navigate(`/desafio/${desafio.id}`)}
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "all 0.3s ease",
        border: "1px solid #e8e8e8",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
        }}
      >
        {estaAtivo ? (
          <CountdownTimer
            expiraEm={desafio.expira_em}
            onExpire={() => setDesafioExpirado(true)}
            tamanho="small"
          />
        ) : (
          <div
            style={{
              backgroundColor: estaExpirado ? "#f8d7da" : "#fff3cd",
              color: estaExpirado ? "#721c24" : "#856404",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {estaExpirado ? "⏱ Expirado" : desafio.status}
          </div>
        )}
      </div>

      {!loading && empresa && (
        <div
          onClick={handleClickEmpresa}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "relative", width: "40px", height: "40px" }}>
            <img
              src="http://localhost:3001/FotoPerfil.jpg"
              alt="Foto padrão"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #e0e0e0",
                position: "absolute",
              }}
            />
            {empresa.foto_perfil && (
              <img
                src={`http://localhost:3001/${empresa.foto_perfil.replace(
                  "public/",
                  ""
                )}`}
                alt={empresa.nome}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #e0e0e0",
                  position: "absolute",
                }}
              />
            )}
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: "600",
                fontSize: "14px",
                color: "#2c3e50",
              }}
            >
              {empresa.nome}
            </p>
            <p style={{ margin: 0, fontSize: "12px", color: "#7f8c8d" }}>
              @{empresa.nome_usuario}
            </p>
          </div>
        </div>
      )}

      <h3
        style={{
          margin: "0 0 12px 0",
          fontSize: "19px",
          color: "#2c3e50",
          lineHeight: "1.4",
        }}
      >
        {desafio.titulo}
      </h3>

      {caracteristicas.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "15px",
          }}
        >
          {caracteristicas.slice(0, 4).map((tech, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {tech}
            </span>
          ))}
          {caracteristicas.length > 4 && (
            <span
              style={{
                backgroundColor: "#f5f5f5",
                color: "#666",
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              +{caracteristicas.length - 4}
            </span>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "18px",
          paddingTop: "18px",
          borderTop: "1px solid #eeeeee",
        }}
      >
        <div>
          <p
            style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#7f8c8d" }}
          >
            Orçamento
          </p>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#27ae60",
            }}
          >
            R${" "}
            {Number(desafio.orcamento).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {menorProposta && (
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                margin: "0 0 4px 0",
                fontSize: "12px",
                color: "#7f8c8d",
              }}
            >
              Menor proposta
            </p>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#3498db",
              }}
            >
              R${" "}
              {Number(menorProposta).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
