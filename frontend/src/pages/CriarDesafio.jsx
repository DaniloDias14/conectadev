"use client";

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CARACTERISTICAS_DISPONIVEIS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "HTML",
  "CSS",
  "Tailwind",
  "Bootstrap",
  "SASS",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Firebase",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
  "REST API",
  "GraphQL",
  "WebSocket",
  "Microservices",
  "Machine Learning",
  "IA",
  "Blockchain",
  "Mobile",
  "UI/UX",
];

export default function CriarDesafio() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [orcamento, setOrcamento] = useState("");
  const [minutosExpiracao, setMinutosExpiracao] = useState("30");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { usuario, token } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!token || usuario?.tipo !== "contratante") {
    return (
      <div style={{ padding: "20px", color: "#c00" }}>
        Acesso restrito a contratantes
      </div>
    );
  }

  const formatarReais = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    const numero = Number(numeros) / 100;
    return numero.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleOrcamentoChange = (e) => {
    const valorFormatado = formatarReais(e.target.value);
    setOrcamento(valorFormatado);
  };

  const toggleCaracteristica = (carac) => {
    setCaracteristicas((prev) =>
      prev.includes(carac) ? prev.filter((c) => c !== carac) : [...prev, carac]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    if (
      !titulo.trim() ||
      !descricao.trim() ||
      !requisitos.trim() ||
      caracteristicas.length === 0
    ) {
      setErro("Todos os campos são obrigatórios");
      setCarregando(false);
      return;
    }

    try {
      const orcamentoNumero = Number(
        orcamento.replace(/\./g, "").replace(",", ".")
      );

      await api.post("/desafios", {
        titulo,
        descricao,
        requisitos,
        caracteristicas: JSON.stringify(caracteristicas),
        orcamento: orcamentoNumero,
        minutos_expiracao: Number.parseInt(minutosExpiracao),
      });

      navigate("/feed");
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao criar desafio");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Header />
      <main
        style={{
          flex: 1,
          padding: "30px 20px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h1 style={{ marginBottom: "10px", color: "#2c3e50" }}>
          Criar Novo Desafio
        </h1>
        <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>
          Preencha todos os campos para publicar seu desafio
        </p>

        {erro && (
          <div
            style={{
              backgroundColor: "#fee",
              color: "#c00",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "25px",
              border: "1px solid #fcc",
            }}
          >
            {erro}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "white",
            padding: "35px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Título *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTitulo(e.target.value);
                }
              }}
              required
              maxLength="50"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3498db")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              placeholder="Ex: Desenvolvimento de landing page responsiva"
            />
            <small
              style={{
                color: titulo.length === 50 ? "#e74c3c" : "#7f8c8d",
                display: "block",
                marginTop: "5px",
              }}
            >
              {titulo.length}/50 caracteres{" "}
              {titulo.length === 50 && "- Limite atingido"}
            </small>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Descrição *
            </label>
            <textarea
              value={descricao}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setDescricao(e.target.value);
                }
              }}
              required
              maxLength="1000"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                minHeight: "140px",
                boxSizing: "border-box",
                resize: "vertical",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3498db")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              placeholder="Descreva detalhadamente o que você precisa..."
            />
            <small
              style={{
                color: descricao.length === 1000 ? "#e74c3c" : "#7f8c8d",
                display: "block",
                marginTop: "5px",
              }}
            >
              {descricao.length}/1000 caracteres{" "}
              {descricao.length === 1000 && "- Limite atingido"}
            </small>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Requisitos *
            </label>
            <textarea
              value={requisitos}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setRequisitos(e.target.value);
                }
              }}
              required
              maxLength="500"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                minHeight: "110px",
                boxSizing: "border-box",
                resize: "vertical",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3498db")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              placeholder="Liste os requisitos técnicos necessários..."
            />
            <small
              style={{
                color: requisitos.length === 500 ? "#e74c3c" : "#7f8c8d",
                display: "block",
                marginTop: "5px",
              }}
            >
              {requisitos.length}/500 caracteres{" "}
              {requisitos.length === 500 && "- Limite atingido"}
            </small>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Características / Tecnologias *
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "10px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {CARACTERISTICAS_DISPONIVEIS.map((carac) => (
                <label
                  key={carac}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px 10px",
                    backgroundColor: caracteristicas.includes(carac)
                      ? "#e3f2fd"
                      : "white",
                    borderRadius: "6px",
                    border: `2px solid ${
                      caracteristicas.includes(carac) ? "#2196f3" : "#e0e0e0"
                    }`,
                    transition: "all 0.2s",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) => {
                    if (!caracteristicas.includes(carac)) {
                      e.currentTarget.style.borderColor = "#bbb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!caracteristicas.includes(carac)) {
                      e.currentTarget.style.borderColor = "#e0e0e0";
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={caracteristicas.includes(carac)}
                    onChange={() => toggleCaracteristica(carac)}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  {carac}
                </label>
              ))}
            </div>
            <small
              style={{ color: "#7f8c8d", display: "block", marginTop: "8px" }}
            >
              {caracteristicas.length} selecionada(s)
            </small>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Orçamento (R$) *
            </label>
            <input
              type="text"
              value={orcamento}
              onChange={handleOrcamentoChange}
              required
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3498db")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              placeholder="0,00"
            />
            <small
              style={{ color: "#7f8c8d", display: "block", marginTop: "5px" }}
            >
              Digite apenas números, a formatação é automática
            </small>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: "600",
                color: "#2c3e50",
              }}
            >
              Minutos até Expiração *
            </label>
            <input
              type="number"
              value={minutosExpiracao}
              onChange={(e) => {
                const valor = Number.parseInt(e.target.value);
                if (valor >= 1 && valor <= 60) {
                  setMinutosExpiracao(e.target.value);
                } else if (e.target.value === "") {
                  setMinutosExpiracao("");
                }
              }}
              required
              min="1"
              max="60"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3498db")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              placeholder="30"
            />
            <small
              style={{ color: "#7f8c8d", display: "block", marginTop: "5px" }}
            >
              De 1 a 60 minutos
            </small>
          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: carregando ? "#95a5a6" : "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "17px",
              fontWeight: "600",
              cursor: carregando ? "not-allowed" : "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!carregando) e.target.style.backgroundColor = "#229954";
            }}
            onMouseLeave={(e) => {
              if (!carregando) e.target.style.backgroundColor = "#27ae60";
            }}
          >
            {carregando ? "Criando..." : "Criar Desafio"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
