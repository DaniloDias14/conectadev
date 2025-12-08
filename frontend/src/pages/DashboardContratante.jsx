"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function DashboardContratante() {
  const [desafios, setDesafios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token || usuario?.tipo !== "contratante") {
      navigate("/")
      return
    }

    const carregarDesafios = async () => {
      try {
        const response = await api.get("/desafios/meus-desafios")
        setDesafios(response.data.desafios || [])
      } finally {
        setCarregando(false)
      }
    }

    carregarDesafios()
  }, [token, usuario, navigate])

  if (carregando) return <div style={{ padding: "20px" }}>Carregando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Meus Desafios</h1>
          <button
            onClick={() => navigate("/criar-desafio")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Novo Desafio
          </button>
        </div>

        {desafios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>Você ainda não criou nenhum desafio</div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {desafios.map((desafio) => (
              <div
                key={desafio.id}
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <h3>{desafio.titulo}</h3>
                <p>
                  <strong>Orçamento:</strong> R$ {desafio.orcamento}
                </p>
                <p>
                  <strong>Status:</strong> {desafio.status}
                </p>
                <p style={{ color: "#666" }}>{desafio.descricao.substring(0, 100)}...</p>
                <button
                  onClick={() => navigate(`/desafio/${desafio.id}`)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
