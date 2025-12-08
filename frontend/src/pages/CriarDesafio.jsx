"use client"

import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import api from "../services/api"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function CriarDesafio() {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [requisitos, setRequisitos] = useState("")
  const [linguagens, setLinguagens] = useState("")
  const [orcamento, setOrcamento] = useState("")
  const [diasExpiracao, setDiasExpiracao] = useState("7")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const { usuario, token } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!token || usuario?.tipo !== "contratante") {
    return <div style={{ padding: "20px", color: "#c00" }}>Acesso restrito a contratantes</div>
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    if (titulo.length < 10) {
      setErro("Título deve ter no mínimo 10 caracteres")
      setCarregando(false)
      return
    }

    if (descricao.length < 50) {
      setErro("Descrição deve ter no mínimo 50 caracteres")
      setCarregando(false)
      return
    }

    if (Number.parseFloat(orcamento) <= 0) {
      setErro("Orçamento deve ser maior que 0")
      setCarregando(false)
      return
    }

    try {
      const dataExpiracao = new Date()
      dataExpiracao.setDate(dataExpiracao.getDate() + Number.parseInt(diasExpiracao))

      await api.post("/desafios", {
        titulo,
        descricao,
        requisitos,
        linguagens,
        orcamento: Number.parseFloat(orcamento),
        expira_em: dataExpiracao.toISOString(),
      })

      navigate("/feed")
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao criar desafio")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, padding: "20px", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
        <h1>Criar Novo Desafio</h1>

        {erro && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c00",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              minLength="10"
              maxLength="200"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Título do desafio"
            />
            <small style={{ color: "#666" }}>Mínimo 10 caracteres</small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Descrição *</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              minLength="50"
              maxLength="5000"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                minHeight: "120px",
                boxSizing: "border-box",
              }}
              placeholder="Descrição detalhada do desafio"
            />
            <small style={{ color: "#666" }}>Mínimo 50 caracteres</small>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Requisitos</label>
            <textarea
              value={requisitos}
              onChange={(e) => setRequisitos(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                minHeight: "100px",
                boxSizing: "border-box",
              }}
              placeholder="Requisitos técnicos"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Linguagens Preferidas</label>
            <input
              type="text"
              value={linguagens}
              onChange={(e) => setLinguagens(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="Ex: JavaScript, React, Node.js"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Orçamento (R$) *</label>
            <input
              type="number"
              value={orcamento}
              onChange={(e) => setOrcamento(e.target.value)}
              required
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
              placeholder="0.00"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Dias até Expiração *</label>
            <select
              value={diasExpiracao}
              onChange={(e) => setDiasExpiracao(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            >
              <option value="1">1 dia</option>
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="14">14 dias</option>
              <option value="30">30 dias</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: carregando ? "not-allowed" : "pointer",
              opacity: carregando ? 0.7 : 1,
            }}
          >
            {carregando ? "Criando..." : "Criar Desafio"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
