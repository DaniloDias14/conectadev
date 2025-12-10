"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Modal from "../components/Modal";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";

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
  const [desafioExpirado, setDesafioExpirado] = useState(false);
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

        const estaExpirado =
          new Date(response.data.desafio.expira_em) < new Date();
        if (estaExpirado) {
          setDesafioExpirado(true);
        }

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

      const response = await api.get(`/desafios/${id}`);
      setDesafio(response.data.desafio);
      setMostrarPropostas(false);
    } catch (err) {
      alert(err.response?.data?.mensagem || "Erro ao escolher vencedor");
    }
  };

  const handleExpiracao = async () => {
    console.log("[v0] handleExpiracao chamado");
    setDesafioExpirado(true);
    try {
      const response = await api.get(`/desafios/${id}`);
      setDesafio(response.data.desafio);

      if (
        response.data.desafio.usuario_id === usuario?.id &&
        usuario?.tipo === "contratante"
      ) {
        const propostasRes = await api.get(`/desafios/${id}/propostas`);
        setPropostas(propostasRes.data.propostas || []);
        console.log(
          "[v0] Propostas carregadas:",
          propostasRes.data.propostas.length
        );
      }
    } catch (err) {
      console.error("[v0] Erro ao atualizar desafio expirado:", err);
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

  const estaExpirado =
    new Date(desafio.expira_em) < new Date() || desafioExpirado;
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

  const renderFotoPerfil = (fotoUrl, alt, tamanho = "50px") => (
    <div style={{ position: "relative", width: tamanho, height: tamanho }}>
      <img
        src="http://localhost:3001/FotoPerfil.jpg"
        alt="Foto padrão"
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #e0e0e0",
          position: "absolute",
        }}
      />
      {fotoUrl && (
        <img
          src={`http://localhost:3001/${fotoUrl.replace("public/", "")}`}
          alt={alt}
          style={{
            width: tamanho,
            height: tamanho,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #e0e0e0",
            position: "absolute",
          }}
        />
      )}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {enviandoComentario && (
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
            <p style={{ margin: 0, fontSize: "16px" }}>
              Enviando comentário...
            </p>
          </div>
        </div>
      )}
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
            onClick={() => navigate(`/perfil/@${desafio.nome_usuario}`)}
          >
            {renderFotoPerfil(desafio.usuario_foto, desafio.usuario_nome)}
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

          <div style={{ marginBottom: "20px" }}>
            {estaAtivo ? (
              <div
                style={{
                  backgroundColor: "#e8f5e9",
                  padding: "15px 20px",
                  borderRadius: "8px",
                  border: "2px solid #4caf50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontWeight: "600",
                    color: "#2e7d32",
                    fontSize: "15px",
                  }}
                >
                  ✓ Desafio Ativo
                </span>
                <CountdownTimer
                  expiraEm={desafio.expira_em}
                  onExpire={handleExpiracao}
                  tamanho="normal"
                />
              </div>
            ) : (
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
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  fontSize: "14px",
                }}
              >
                {estaExpirado
                  ? "⏱ Este desafio expirou"
                  : estaConcluido
                  ? "✓ Desafio concluído"
                  : "Desafio não está ativo"}
              </div>
            )}
          </div>

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
                onClick={() =>
                  navigate(`/perfil/@${desafio.vencedor_nome_usuario}`)
                }
              >
                {renderFotoPerfil(desafio.vencedor_foto, desafio.vencedor_nome)}
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
                    padding: "14px 28px",
                    backgroundColor: "#9c27b0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "15px",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#7b1fa2")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#9c27b0")
                  }
                >
                  {mostrarPropostas
                    ? "Ocultar Propostas"
                    : "Selecionar Vencedor"}{" "}
                  ({propostas.length} propostas)
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
                              navigate(
                                `/perfil/@${proposta.usuario_nome_usuario}`
                              )
                            }
                          >
                            {renderFotoPerfil(
                              proposta.usuario_foto,
                              proposta.usuario_nome,
                              "40px"
                            )}
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
                            transition: "background-color 0.3s",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.backgroundColor = "#229954")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.backgroundColor = "#27ae60")
                          }
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
              comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  style={{
                    marginBottom: "25px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #eeeeee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/perfil/@${comentario.usuario_nome_usuario}`)
                      }
                    >
                      {renderFotoPerfil(
                        comentario.usuario_foto,
                        comentario.usuario_nome,
                        "45px"
                      )}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: "600",
                          fontSize: "15px",
                        }}
                      >
                        {comentario.usuario_nome}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
                        {new Date(comentario.criado_em).toLocaleString("pt-BR")}
                      </p>
                      <p
                        style={{
                          margin: "0 0 12px 0",
                          color: "#444",
                          lineHeight: "1.6",
                        }}
                      >
                        {comentario.mensagem}
                      </p>
                    </div>
                  </div>

                  {estaAtivo && (
                    <button
                      onClick={() =>
                        setComentarioRespondendo(
                          comentarioRespondendo === comentario.id
                            ? null
                            : comentario.id
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
                      {comentarioRespondendo === comentario.id
                        ? "Cancelar"
                        : "Responder Comentário"}
                    </button>
                  )}

                  {comentarioRespondendo === comentario.id && (
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
                          onClick={() => handleEnviarResposta(comentario.id)}
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

                  {comentario.respostas &&
                    comentario.respostas.map((resposta) => (
                      <div
                        key={resposta.id}
                        style={{
                          backgroundColor: "white",
                          padding: "15px",
                          borderRadius: "6px",
                          marginTop: "12px",
                          marginLeft: "25px",
                          borderLeft: "3px solid #e0e0e0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate(
                                `/perfil/@${resposta.usuario_nome_usuario}`
                              )
                            }
                          >
                            {renderFotoPerfil(
                              resposta.usuario_foto,
                              resposta.usuario_nome,
                              "35px"
                            )}
                          </div>
                          <div>
                            <p
                              style={{
                                margin: 0,
                                fontWeight: "600",
                                fontSize: "14px",
                              }}
                            >
                              {resposta.usuario_nome}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "11px",
                                color: "#888",
                              }}
                            >
                              {new Date(resposta.criado_em).toLocaleString(
                                "pt-BR"
                              )}
                            </p>
                          </div>
                        </div>
                        <p
                          style={{ margin: 0, color: "#555", fontSize: "14px" }}
                        >
                          {resposta.mensagem}
                        </p>
                      </div>
                    ))}
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
