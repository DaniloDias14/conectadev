"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function DashboardProponente() {
  const [propostas, setPropostas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token || usuario?.tipo !== "proponente") {
      navigate("/")
      return
    }

    const carregarPropostas = async () => {
      try {
        const response = await api.get("/propostas/minhas-propostas")
        setPropostas(response.data.propostas || [])
      } finally {
        setCarregando(false)
      }
    }

    carregarPropostas()
  }, [token, usuario, navigate])

  if (carregando) return <div style={{ padding: "20px" }}>Carregando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1>Minhas Atividades</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div style={{ backgroundColor: "#e3f2fd", padding: "20px", borderRadius: "8px" }}>
            <h3>Total de Propostas</h3>
            <p style={{ fontSize: "28px", fontWeight: "bold" }}>{propostas.length}</p>
          </div>
        </div>

        {propostas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", marginTop: "20px", color: "#666" }}>
            Você ainda não enviou nenhuma proposta
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>
            {propostas.map((proposta) => (
              <div
                key={proposta.id}
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                }}
              >
                <h3>{proposta.desafio?.titulo}</h3>
                <p>
                  <strong>Valor:</strong> R$ {proposta.valor}
                </p>
                <p>
                  <strong>Status:</strong> {proposta.desafio?.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
