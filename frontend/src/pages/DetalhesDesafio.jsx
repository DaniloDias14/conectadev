"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function DetalhesDesafio() {
  const { id } = useParams();
  const [desafio, setDesafio] = useState(null);
  const [mostraModal, setMostraModal] = useState(false);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarioRespondendo, setComentarioRespondendo] = useState(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [erro, setErro] = useState("");
  const [propostas, setPropostas] = useState([]);
  const [mostrarPropostas, setMostrarPropostas] = useState(false);
  const { usuario, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const carregarDesafio = async () => {
      try {
        const response = await api.get(`/desafios/${id}`);
        setDesafio(response.data.desafio);
        setComentarios(response.data.comentarios || []);

        if (
          usuario?.tipo === "contratante" &&
          response.data.desafio.usuario_id === usuario.id
        ) {
          const propostasRes = await api.get(`/desafios/${id}/propostas`);
          setPropostas(propostasRes.data.propostas || []);
        }
      } catch (err) {
        setErro("Desafio não encontrado");
      } finally {
        setCarregando(false);
      }
    };

    carregarDesafio();
  }, [id, token, navigate, usuario]);

  const handleEnviarComentario = async () => {
    if (!novoComentario.trim()) return;

    setEnviandoComentario(true);

    try {
      await api.post("/comentarios", {
        desafio_id: id,
        mensagem: novoComentario,
      });

      setNovoComentario("");
      const response = await api.get(`/desafios/${id}`);
      setComentarios(response.data.comentarios || []);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao enviar comentário");
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleEnviarResposta = async (comentarioPaiId) => {
    if (!textoResposta.trim()) return;

    setEnviandoComentario(true);

    try {
      await api.post("/comentarios", {
        desafio_id: id,
        mensagem: textoResposta,
        comentario_pai_id: comentarioPaiId,
      });

      setTextoResposta("");
      setComentarioRespondendo(null);
      const response = await api.get(`/desafios/${id}`);
      setComentarios(response.data.comentarios || []);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao enviar resposta");
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleEscolherVencedor = async (propostaId) => {
    if (
      !window.confirm(
        "Tem certeza que deseja escolher este proponente como vencedor?"
      )
    ) {
      return;
    }

    try {
      await api.post(`/desafios/${id}/escolher-vencedor`, { propostaId });
      alert("Vencedor escolhido com sucesso!");

      // Recarregar dados
      const response = await api.get(`/desafios/${id}`);
      setDesafio(response.data.desafio);
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao escolher vencedor");
    }
  };

  if (carregando)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
    );
  if (erro && !desafio)
    return <div style={{ padding: "20px", color: "#c00" }}>{erro}</div>;
  if (!desafio)
    return <div style={{ padding: "20px" }}>Desafio não encontrado</div>;

  const estaExpirado = new Date(desafio.expira_em) < new Date();
  const estaAtivo = desafio.status === "ativo" && !estaExpirado;
  const estaConcluido = desafio.status === "concluido";
  const ehContratante =
    usuario?.tipo === "contratante" && desafio.usuario_id === usuario.id;

  let caracteristicas = [];
  try {
    caracteristicas = JSON.parse(desafio.caracteristicas || "[]");
  } catch (e) {
    caracteristicas = desafio.caracteristicas ? [desafio.caracteristicas] : [];
  }

  const OverlayBloqueio = () =>
    enviandoComentario ? (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
          zIndex: 9999,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <p style={{ margin: 0, fontSize: "16px" }}>Enviando comentário...</p>
        </div>
      </div>
    ) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <OverlayBloqueio />
      <Header />
      <main
        style={{
          flex: 1,
          padding: "30px 20px",
          maxWidth: "900px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "35px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              paddingBottom: "20px",
              borderBottom: "2px solid #f0f0f0",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/perfil/${desafio.usuario_id}`)}
          >
            <img
              src={
                desafio.usuario_foto || "http://localhost:3001/FotoPerfil.jpg"
              }
              alt={desafio.usuario_nome}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #e0e0e0",
              }}
            />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: "600",
                  fontSize: "16px",
                  color: "#2c3e50",
                }}
              >
                {desafio.usuario_nome}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#7f8c8d" }}>
                @{desafio.nome_usuario}
              </p>
            </div>
          </div>

          {!estaAtivo && (
            <div
              style={{
                backgroundColor: estaExpirado
                  ? "#fff3cd"
                  : estaConcluido
                  ? "#d4edda"
                  : "#f8d7da",
                color: estaExpirado
                  ? "#856404"
                  : estaConcluido
                  ? "#155724"
                  : "#721c24",
                padding: "15px 20px",
                borderRadius: "8px",
                marginBottom: "25px",
                border: `2px solid ${
                  estaExpirado
                    ? "#ffc107"
                    : estaConcluido
                    ? "#28a745"
                    : "#dc3545"
                }`,
                fontSize: "15px",
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {estaExpirado
                ? "⏱ Este desafio expirou"
                : estaConcluido
                ? "✓ Desafio concluído"
                : "Desafio não está ativo"}
            </div>
          )}

          <h1
            style={{ marginBottom: "15px", color: "#2c3e50", fontSize: "28px" }}
          >
            {desafio.titulo}
          </h1>

          <div
            style={{
              display: "flex",
              gap: "25px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                backgroundColor: "#e8f5e9",
                padding: "12px 18px",
                borderRadius: "8px",
                border: "1px solid #c8e6c9",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "12px",
                  color: "#388e3c",
                  fontWeight: "600",
                }}
              >
                ORÇAMENTO
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#2e7d32",
                }}
              >
                R${" "}
                {Number(desafio.orcamento).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {desafio.menor_proposta && (
              <div
                style={{
                  backgroundColor: "#e3f2fd",
                  padding: "12px 18px",
                  borderRadius: "8px",
                  border: "1px solid #bbdefb",
                }}
              >
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: "12px",
                    color: "#1976d2",
                    fontWeight: "600",
                  }}
                >
                  MENOR PROPOSTA
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#1565c0",
                  }}
                >
                  R${" "}
                  {Number(desafio.menor_proposta).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}

            <div
              style={{
                backgroundColor: "#f3e5f5",
                padding: "12px 18px",
                borderRadius: "8px",
                border: "1px solid #e1bee7",
              }}
            >
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "12px",
                  color: "#7b1fa2",
                  fontWeight: "600",
                }}
              >
                PROPOSTAS
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#6a1b9a",
                }}
              >
                {desafio.total_propostas || 0}
              </p>
            </div>
          </div>

          {caracteristicas.length > 0 && (
            <div style={{ marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  marginBottom: "12px",
                  color: "#2c3e50",
                }}
              >
                Tecnologias
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {caracteristicas.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      padding: "6px 14px",
                      borderRadius: "16px",
                      fontSize: "13px",
                      fontWeight: "500",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "25px" }}>
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                color: "#2c3e50",
              }}
            >
              Descrição
            </h3>
            <p
              style={{
                color: "#555",
                lineHeight: "1.7",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {desafio.descricao}
            </p>
          </div>

          {desafio.requisitos && (
            <div style={{ marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  marginBottom: "10px",
                  color: "#2c3e50",
                }}
              >
                Requisitos
              </h3>
              <p
                style={{
                  color: "#555",
                  lineHeight: "1.7",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                }}
              >
                {desafio.requisitos}
              </p>
            </div>
          )}

          {estaConcluido && desafio.vencedor_id && (
            <div
              style={{
                backgroundColor: "#d4edda",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "25px",
                border: "2px solid #28a745",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#155724" }}>
                🏆 Vencedor do Desafio
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/perfil/${desafio.vencedor_id}`)}
              >
                <img
                  src={
                    desafio.vencedor_foto ||
                    "http://localhost:3001/FotoPerfil.jpg"
                  }
                  alt={desafio.vencedor_nome}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #28a745",
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "#155724",
                  }}
                >
                  {desafio.vencedor_nome}
                </p>
              </div>
            </div>
          )}

          {usuario?.tipo === "proponente" && estaAtivo && (
            <button
              onClick={() => setMostraModal(true)}
              style={{
                padding: "14px 28px",
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "30px",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2980b9")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3498db")}
            >
              Enviar Proposta
            </button>
          )}

          {ehContratante &&
            estaExpirado &&
            !estaConcluido &&
            propostas.length > 0 && (
              <div style={{ marginBottom: "30px" }}>
                <button
                  onClick={() => setMostrarPropostas(!mostrarPropostas)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#9c27b0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginBottom: "15px",
                  }}
                >
                  {mostrarPropostas ? "Ocultar" : "Ver"} Propostas (
                  {propostas.length})
                </button>

                {mostrarPropostas && (
                  <div
                    style={{
                      display: "grid",
                      gap: "15px",
                      marginTop: "15px",
                    }}
                  >
                    {propostas.map((proposta) => (
                      <div
                        key={proposta.id}
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(`/perfil/${proposta.usuario_id}`)
                            }
                          >
                            <img
                              src={
                                proposta.usuario_foto ||
                                "http://localhost:3001/FotoPerfil.jpg"
                              }
                              alt={proposta.usuario_nome}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <p style={{ margin: 0, fontWeight: "600" }}>
                              {proposta.usuario_nome}
                            </p>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#27ae60",
                            }}
                          >
                            R${" "}
                            {Number(proposta.valor).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <p style={{ margin: "0 0 10px 0", color: "#555" }}>
                          {proposta.justificativa}
                        </p>
                        <p
                          style={{
                            margin: "0 0 15px 0",
                            fontSize: "13px",
                            color: "#888",
                          }}
                        >
                          Prazo: {proposta.prazo_estimado} dias
                        </p>
                        <button
                          onClick={() => handleEscolherVencedor(proposta.id)}
                          style={{
                            padding: "10px 20px",
                            backgroundColor: "#27ae60",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                          }}
                        >
                          Escolher como Vencedor
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          <div
            style={{
              marginTop: "35px",
              paddingTop: "35px",
              borderTop: "2px solid #f0f0f0",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                marginBottom: "20px",
                color: "#2c3e50",
              }}
            >
              Comentários ({comentarios.length})
            </h3>

            {estaAtivo ? (
              <div style={{ marginBottom: "25px" }}>
                <textarea
                  value={novoComentario}
                  onChange={(e) => {
                    if (e.target.value.length <= 250) {
                      setNovoComentario(e.target.value);
                    }
                  }}
                  maxLength="250"
                  placeholder="Deixe um comentário..."
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    minHeight: "90px",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                  disabled={enviandoComentario}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px",
                  }}
                >
                  <small
                    style={{
                      color:
                        novoComentario.length === 250 ? "#e74c3c" : "#7f8c8d",
                    }}
                  >
                    {novoComentario.length}/250{" "}
                    {novoComentario.length === 250 && "- Limite atingido"}
                  </small>
                  <button
                    onClick={handleEnviarComentario}
                    disabled={enviandoComentario || !novoComentario.trim()}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: enviandoComentario
                        ? "#95a5a6"
                        : "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor:
                        enviandoComentario || !novoComentario.trim()
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: "600",
                      opacity: !novoComentario.trim() ? 0.5 : 1,
                    }}
                  >
                    {enviandoComentario ? "Enviando..." : "Comentar"}
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                Comentários estão bloqueados neste desafio
              </div>
            )}

            {comentarios.length === 0 ? (
              <p
                style={{ color: "#999", textAlign: "center", padding: "20px" }}
              >
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comentarios.map((com) => (
                <div
                  key={com.id}
                  style={{
                    padding: "16px",
                    backgroundColor: "#f9f9f9",
                    borderLeft: "4px solid #3498db",
                    marginBottom: "15px",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <img
                      src={
                        com.usuario_foto ||
                        "http://localhost:3001/FotoPerfil.jpg"
                      }
                      alt={com.usuario_nome}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <p
                      style={{ margin: 0, fontWeight: "600", color: "#2c3e50" }}
                    >
                      {com.usuario_nome}
                    </p>
                    <small style={{ color: "#999" }}>
                      {new Date(com.criado_em).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      color: "#333",
                      lineHeight: "1.5",
                    }}
                  >
                    {com.mensagem}
                  </p>

                  {estaAtivo && (
                    <button
                      onClick={() =>
                        setComentarioRespondendo(
                          comentarioRespondendo === com.id ? null : com.id
                        )
                      }
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "#3498db",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        padding: "4px 0",
                      }}
                      disabled={enviandoComentario}
                    >
                      {comentarioRespondendo === com.id
                        ? "Cancelar"
                        : "Responder Comentário"}
                    </button>
                  )}

                  {comentarioRespondendo === com.id && (
                    <div style={{ marginTop: "12px", paddingLeft: "20px" }}>
                      <textarea
                        value={textoResposta}
                        onChange={(e) => {
                          if (e.target.value.length <= 250) {
                            setTextoResposta(e.target.value);
                          }
                        }}
                        maxLength="250"
                        placeholder="Escreva sua resposta..."
                        style={{
                          width: "100%",
                          padding: "10px",
                          border: "2px solid #e0e0e0",
                          borderRadius: "6px",
                          fontSize: "13px",
                          minHeight: "70px",
                          boxSizing: "border-box",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                        disabled={enviandoComentario}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "6px",
                        }}
                      >
                        <small
                          style={{
                            color:
                              textoResposta.length === 250
                                ? "#e74c3c"
                                : "#7f8c8d",
                          }}
                        >
                          {textoResposta.length}/250
                        </small>
                        <button
                          onClick={() => handleEnviarResposta(com.id)}
                          disabled={enviandoComentario || !textoResposta.trim()}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: enviandoComentario
                              ? "#95a5a6"
                              : "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor:
                              enviandoComentario || !textoResposta.trim()
                                ? "not-allowed"
                                : "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            opacity: !textoResposta.trim() ? 0.5 : 1,
                          }}
                        >
                          {enviandoComentario
                            ? "Enviando..."
                            : "Enviar Resposta"}
                        </button>
                      </div>
                    </div>
                  )}

                  {com.respostas && com.respostas.length > 0 && (
                    <div
                      style={{
                        marginTop: "15px",
                        paddingLeft: "20px",
                        borderLeft: "2px solid #ddd",
                      }}
                    >
                      {com.respostas.map((resposta) => (
                        <div
                          key={resposta.id}
                          style={{
                            padding: "12px",
                            backgroundColor: "#ffffff",
                            marginBottom: "10px",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                            }}
                          >
                            <img
                              src={
                                resposta.usuario_foto ||
                                "http://localhost:3001/FotoPerfil.jpg"
                              }
                              alt={resposta.usuario_nome}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <p
                              style={{
                                margin: 0,
                                fontWeight: "600",
                                fontSize: "14px",
                                color: "#2c3e50",
                              }}
                            >
                              {resposta.usuario_nome}
                            </p>
                            <small style={{ color: "#999", fontSize: "12px" }}>
                              {new Date(resposta.criado_em).toLocaleDateString(
                                "pt-BR"
                              )}
                            </small>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "#555",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}
                          >
                            {resposta.mensagem}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />

      {mostraModal && (
        <Modal desafioId={id} onClose={() => setMostraModal(false)} />
      )}
    </div>
  );
}
