"use client"
import { useNavigate } from "react-router-dom"

export default function CardDesafio({ desafio }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/desafio/${desafio.id}`)}
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        cursor: "pointer",
        transition: "transform 0.2s",
        ":hover": {
          transform: "translateY(-5px)",
        },
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>{desafio.titulo}</h3>

      <p
        style={{
          margin: "10px 0",
          color: "#666",
          fontSize: "14px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {desafio.descricao}
      </p>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "14px",
        }}
      >
        <span
          style={{
            backgroundColor: "#e3f2fd",
            padding: "5px 10px",
            borderRadius: "4px",
            color: "#1976d2",
          }}
        >
          R$ {desafio.orcamento}
        </span>
        <span
          style={{
            backgroundColor: desafio.status === "ativo" ? "#e8f5e9" : "#fff3cd",
            padding: "5px 10px",
            borderRadius: "4px",
            color: desafio.status === "ativo" ? "#388e3c" : "#856404",
            fontSize: "12px",
          }}
        >
          {desafio.status === "ativo" ? "✓ Ativo" : "Expirado"}
        </span>
      </div>

      {desafio.linguagens && (
        <div style={{ marginTop: "10px" }}>
          <small style={{ color: "#999" }}>Tecnologias: {desafio.linguagens}</small>
        </div>
      )}
    </div>
  )
}
