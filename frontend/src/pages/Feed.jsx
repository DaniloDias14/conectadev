"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"
import CardDesafio from "../components/CardDesafio"

export default function Feed() {
  const [desafios, setDesafios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    const carregarDesafios = async () => {
      try {
        const response = await api.get("/desafios")
        setDesafios(response.data.desafios || [])
      } catch (err) {
        setErro("Erro ao carregar desafios")
      } finally {
        setCarregando(false)
      }
    }

    carregarDesafios()
  }, [token, navigate])

  if (carregando) return <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1>Desafios Disponíveis</h1>
          {usuario?.tipo === "contratante" && (
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
              + Criar Desafio
            </button>
          )}
        </div>

        {erro && <div style={{ color: "#c00", marginBottom: "20px" }}>{erro}</div>}

        {desafios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
            Nenhum desafio disponível no momento
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {desafios.map((desafio) => (
              <CardDesafio key={desafio.id} desafio={desafio} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
