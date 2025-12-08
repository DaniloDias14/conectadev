"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function DashboardAdmin() {
  const [metricas, setMetricas] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token || usuario?.tipo !== "admin") {
      navigate("/")
      return
    }

    const carregarMetricas = async () => {
      try {
        const response = await api.get("/admin/metricas")
        setMetricas(response.data)
      } finally {
        setCarregando(false)
      }
    }

    carregarMetricas()
  }, [token, usuario, navigate])

  if (carregando) return <div style={{ padding: "20px" }}>Carregando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1>Dashboard Administrador</h1>

        {metricas && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <div style={{ backgroundColor: "#e3f2fd", padding: "20px", borderRadius: "8px" }}>
              <h3>Total de Usuários</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>{metricas.totalUsuarios || 0}</p>
            </div>
            <div style={{ backgroundColor: "#f3e5f5", padding: "20px", borderRadius: "8px" }}>
              <h3>Desafios Ativos</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>{metricas.desafiosAtivos || 0}</p>
            </div>
            <div style={{ backgroundColor: "#e8f5e9", padding: "20px", borderRadius: "8px" }}>
              <h3>Total de Propostas</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>{metricas.totalPropostas || 0}</p>
            </div>
            <div style={{ backgroundColor: "#fff3e0", padding: "20px", borderRadius: "8px" }}>
              <h3>Desafios Concluídos</h3>
              <p style={{ fontSize: "28px", fontWeight: "bold" }}>{metricas.desafiosConcluidos || 0}</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
