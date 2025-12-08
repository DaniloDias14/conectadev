"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function MinhasPropostas() {
  const [propostas, setPropostas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    const carregarPropostas = async () => {
      try {
        const response = await api.get("/propostas/minhas-propostas")
        setPropostas(response.data.propostas || [])
      } catch (err) {
        setErro("Erro ao carregar propostas")
      } finally {
        setCarregando(false)
      }
    }

    carregarPropostas()
  }, [token, navigate])

  const handleCancelar = async (propostaId) => {
    if (!window.confirm("Tem certeza que deseja cancelar esta proposta?")) return

    try {
      await api.delete(`/propostas/${propostaId}`)
      setPropostas(propostas.filter((p) => p.id !== propostaId))
    } catch (err) {
      setErro("Erro ao cancelar proposta")
    }
  }

  if (carregando) return <div style={{ padding: "20px" }}>Carregando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
        <h1>Minhas Propostas</h1>

        {erro && <div style={{ color: "#c00", marginBottom: "20px" }}>{erro}</div>}

        {propostas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            Você ainda não enviou nenhuma proposta
          </div>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
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
                  <strong>Prazo:</strong> {proposta.prazo_estimado} dias
                </p>
                <p>
                  <strong>Status:</strong> {proposta.desafio?.status}
                </p>
                <p style={{ color: "#666" }}>{proposta.justificativa}</p>

                {proposta.desafio?.status === "ativo" && (
                  <button
                    onClick={() => handleCancelar(proposta.id)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "10px",
                    }}
                  >
                    Cancelar Proposta
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
