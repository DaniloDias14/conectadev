"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Modal from "../components/Modal"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function DetalhesDesafio() {
  const { id } = useParams()
  const [desafio, setDesafio] = useState(null)
  const [mostraModal, setMostraModal] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [novoComentario, setNovoComentario] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    const carregarDesafio = async () => {
      try {
        const response = await api.get(`/desafios/${id}`)
        setDesafio(response.data.desafio)
        setComentarios(response.data.comentarios || [])
      } catch (err) {
        setErro("Desafio não encontrado")
      } finally {
        setCarregando(false)
      }
    }

    carregarDesafio()
  }, [id, token, navigate])

  const handleEnviarComentario = async () => {
    if (!novoComentario.trim()) return

    try {
      await api.post("/comentarios", {
        desafio_id: id,
        mensagem: novoComentario,
      })

      setNovoComentario("")
      const response = await api.get(`/desafios/${id}`)
      setComentarios(response.data.comentarios || [])
    } catch (err) {
      setErro("Erro ao enviar comentário")
    }
  }

  if (carregando) return <div style={{ padding: "20px" }}>Carregando...</div>
  if (erro) return <div style={{ padding: "20px", color: "#c00" }}>{erro}</div>
  if (!desafio) return <div style={{ padding: "20px" }}>Desafio não encontrado</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <button
          onClick={() => navigate("/feed")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ← Voltar
        </button>

        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h1 style={{ marginBottom: "10px" }}>{desafio.titulo}</h1>
          <p style={{ color: "#666", marginBottom: "20px" }}>Orçamento: R$ {desafio.orcamento}</p>

          <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
            <h3>Descrição</h3>
            <p>{desafio.descricao}</p>

            {desafio.requisitos && (
              <>
                <h3>Requisitos</h3>
                <p>{desafio.requisitos}</p>
              </>
            )}

            {desafio.linguagens && (
              <>
                <h3>Linguagens Preferidas</h3>
                <p>{desafio.linguagens}</p>
              </>
            )}
          </div>

          {usuario?.tipo === "proponente" && desafio.status === "ativo" && (
            <button
              onClick={() => setMostraModal(true)}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "30px",
              }}
            >
              Enviar Proposta
            </button>
          )}

          <div style={{ marginBottom: "20px" }}>
            <h3>Comentários</h3>
            <div style={{ marginBottom: "15px" }}>
              <textarea
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Deixe um comentário..."
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  minHeight: "80px",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleEnviarComentario}
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Comentar
              </button>
            </div>

            {comentarios.map((com) => (
              <div
                key={com.id}
                style={{
                  padding: "12px",
                  backgroundColor: "#f9f9f9",
                  borderLeft: "3px solid #007bff",
                  marginBottom: "10px",
                  borderRadius: "4px",
                }}
              >
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>Anônimo</p>
                <p style={{ margin: 0, color: "#333" }}>{com.mensagem}</p>
                <small style={{ color: "#999" }}>{new Date(com.criado_em).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {mostraModal && <Modal desafioId={id} onClose={() => setMostraModal(false)} />}
    </div>
  )
}
