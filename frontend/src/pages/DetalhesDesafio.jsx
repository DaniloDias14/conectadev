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
  const [carregandoPropostas, setCarregandoPropostas] = useState(false);
  const { usuario, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const carregarDesafio = async () => {
      try {
        console.log("[v0] Carregando desafio ID:", id);
        const response = await api.get(`/desafios/${id}`);
        const desafioData = response.data.desafio;
        setDesafio(desafioData);
        setComentarios(response.data.comentarios || []);

        console.log("[v0] Desafio carregado. Status:", desafioData.status);
        console.log("[v0] Desafio expira em:", desafioData.expira_em);
        console.log("[v0] Agora é:", new Date().toISOString());

        const estaExpirado = new Date(desafioData.expira_em) < new Date();
        console.log("[v0] Está expirado?", estaExpirado);

        if (estaExpirado) {
          setDesafioExpirado(true);
          console.log("[v0] Desafio está expirado");
        }
      } catch (err) {
        console.error("[v0] Erro ao carregar desafio:", err);
        setErro("Desafio não encontrado");
      } finally {
        setCarregando(false);
      }
    };

    carregarDesafio();
  }, [id, token, navigate]);

  useEffect(() => {
    const carregarPropostasSeNecessario = async () => {
      if (!desafio || !usuario) return;

      const estaExpirado = new Date(desafio.expira_em) < new Date();
      const ehDono = desafio.usuario_id === usuario.id;
      const ehContratante = usuario.tipo === "contratante";

      console.log("[v0] Verificando se deve carregar propostas...");
      console.log("[v0] Expirado?", estaExpirado);
      console.log("[v0] É dono?", ehDono);
      console.log("[v0] É contratante?", ehContratante);
      console.log("[v0] Propostas já carregadas?", propostas.length > 0);

      if (estaExpirado && ehDono && ehContratante && propostas.length === 0) {
        console.log("[v0] Carregando propostas...");
        await carregarPropostas();
      }
    };

    carregarPropostasSeNecessario();
  }, [desafio, usuario, propostas.length]);

  const carregarPropostas = async () => {
    if (carregandoPropostas) return;

    setCarregandoPropostas(true);
    try {
      console.log("[v0] Requisição GET /desafios/" + id + "/propostas");
      const response = await api.get(`/desafios/${id}/propostas`);
      const propostasData = response.data.propostas || [];
      console.log(
        "[v0] Propostas carregadas com sucesso:",
        propostasData.length
      );
      setPropostas(propostasData);
    } catch (err) {
      console.error(
        "[v0] Erro ao carregar propostas:",
        err.response?.data || err.message
      );
      setErro(err.response?.data?.mensagem || "Erro ao carregar propostas");
      setPropostas([]);
    } finally {
      setCarregandoPropostas(false);
    }
  };

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
      console.log("[v0] Escolhendo vencedor. Proposta ID:", propostaId);
      await api.post(`/desafios/${id}/escolher-vencedor`, { propostaId });
      alert("Vencedor escolhido com sucesso!");

      // Recarregar desafio para ver o novo status
      const response = await api.get(`/desafios/${id}`);
      setDesafio(response.data.desafio);
      setMostrarPropostas(false);
      setPropostas([]);
    } catch (err) {
      console.error("[v0] Erro ao escolher vencedor:", err);
      alert(err.response?.data?.mensagem || "Erro ao escolher vencedor");
    }
  };

  const handleExpiracao = async () => {
    console.log("[v0] Desafio expirou! (countdown terminou)");
    setDesafioExpirado(true);

    // Recarregar o desafio para atualizar status
    try {
      const response = await api.get(`/desafios/${id}`);
      const desafioAtualizado = response.data.desafio;
      setDesafio(desafioAtualizado);
      console.log("[v0] Desafio atualizado após expiração");
    } catch (err) {
      console.error("[v0] Erro ao recarregar desafio:", err);
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
    desafio.status === "expirado" || desafio.status === "concluido";
  const estaAtivo = desafio.status === "ativo";
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
          onError={(e) => {
            e.target.style.display = "none";
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
            onClick={() => navigate(`/perfil/${desafio.nome_usuario}`)}
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

          {estaConcluido && desafio.vencedor_proposta_id && (
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
                  navigate(`/perfil/${desafio.vencedor_nome_usuario}`)
                }
              >
                {renderFotoPerfil(desafio.vencedor_foto, desafio.vencedor_nome)}
                <div>
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
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#2d5016",
                    }}
                  >
                    @{desafio.vencedor_nome_usuario}
                  </p>
                </div>
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

          {ehContratante && estaExpirado && !estaConcluido && (
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  backgroundColor: "#fff3cd",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "2px solid #ffc107",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#856404",
                    fontWeight: "600",
                  }}
                >
                  ⏱ O desafio expirou! Escolha um vencedor entre as propostas
                  recebidas.
                </p>
              </div>

              <button
                onClick={() => {
                  if (propostas.length === 0) {
                    carregarPropostas();
                  }
                  setMostrarPropostas(!mostrarPropostas);
                }}
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
                  width: "100%",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#7b1fa2")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#9c27b0")
                }
              >
                {mostrarPropostas
                  ? "Esconder Propostas"
                  : "Selecionar Vencedor"}
              </button>

              {carregandoPropostas && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  Carregando propostas...
                </div>
              )}

              {mostrarPropostas && propostas.length > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>
                    Propostas Recebidas ({propostas.length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {propostas.map((proposta) => (
                      <div
                        key={proposta.id}
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "15px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              navigate(
                                `/perfil/${proposta.usuario_nome_usuario}`
                              )
                            }
                          >
                            {renderFotoPerfil(
                              proposta.usuario_foto,
                              proposta.usuario_nome,
                              "40px"
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontWeight: "600",
                                  color: "#2c3e50",
                                  fontSize: "14px",
                                }}
                              >
                                {proposta.usuario_nome}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "12px",
                                  color: "#7f8c8d",
                                }}
                              >
                                @{proposta.usuario_nome_usuario}
                              </p>
                              <p
                                style={{
                                  margin: "4px 0 0 0",
                                  fontSize: "13px",
                                  color: "#2e7d32",
                                  fontWeight: "600",
                                }}
                              >
                                R${" "}
                                {Number(proposta.valor).toLocaleString(
                                  "pt-BR",
                                  { minimumFractionDigits: 2 }
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleEscolherVencedor(proposta.id)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#27ae60",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "13px",
                              transition: "background-color 0.3s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.backgroundColor = "#229954")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.backgroundColor = "#27ae60")
                            }
                          >
                            Escolher
                          </button>
                        </div>

                        <div
                          style={{
                            backgroundColor: "white",
                            padding: "12px",
                            borderRadius: "6px",
                            border: "1px solid #eee",
                            marginTop: "8px",
                          }}
                        >
                          <div style={{ marginBottom: "10px" }}>
                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#7f8c8d",
                                textTransform: "uppercase",
                              }}
                            >
                              Justificativa
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: "#2c3e50",
                                lineHeight: "1.4",
                              }}
                            >
                              {proposta.justificativa ||
                                "Sem justificativa fornecida"}
                            </p>
                          </div>

                          <div>
                            <p
                              style={{
                                margin: "0 0 6px 0",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#7f8c8d",
                                textTransform: "uppercase",
                              }}
                            >
                              Prazo Estimado
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "13px",
                                color: "#2c3e50",
                              }}
                            >
                              {proposta.prazo_estimado}{" "}
                              {proposta.prazo_estimado === 1 ? "dia" : "dias"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mostrarPropostas &&
                propostas.length === 0 &&
                !carregandoPropostas && (
                  <div
                    style={{
                      backgroundColor: "#f0f0f0",
                      padding: "20px",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    Nenhuma proposta recebida para este desafio.
                  </div>
                )}
            </div>
          )}

          {usuario?.tipo === "proponente" && !estaAtivo && (
            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "8px",
                textAlign: "center",
                color: "#666",
              }}
            >
              Este desafio não está mais ativo.
            </div>
          )}
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>
            Comentários
          </h2>

          {usuario?.tipo === "contratante" && !estaAtivo && (
            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                color: "#666",
              }}
            >
              Comentários desativados para desafios não ativos.
            </div>
          )}

          {estaAtivo &&
            (usuario?.tipo === "proponente" ||
              (usuario?.tipo === "contratante" &&
                desafio.usuario_id === usuario.id)) && (
              <div style={{ marginBottom: "20px" }}>
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Deixe um comentário..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                />
                <button
                  onClick={handleEnviarComentario}
                  disabled={!novoComentario.trim()}
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Enviar
                </button>
              </div>
            )}

          {comentarios.map((comentario) => (
            <div
              key={comentario.id}
              style={{
                backgroundColor: "#f9f9f9",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "12px",
                border: "1px solid #eee",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                {renderFotoPerfil(
                  comentario.usuario_foto,
                  comentario.usuario_nome,
                  "36px"
                )}
                <div>
                  <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>
                    {comentario.usuario_nome}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#7f8c8d" }}>
                    @{comentario.usuario_nome_usuario}
                  </p>
                </div>
              </div>
              <p
                style={{
                  margin: "10px 0",
                  color: "#333",
                  lineHeight: "1.5",
                }}
              >
                {comentario.mensagem}
              </p>

              {estaAtivo &&
                (usuario?.tipo === "proponente" ||
                  (usuario?.tipo === "contratante" &&
                    desafio.usuario_id === usuario.id)) && (
                  <button
                    onClick={() => setComentarioRespondendo(comentario.id)}
                    style={{
                      marginTop: "8px",
                      padding: "6px 12px",
                      backgroundColor: "#ecf0f1",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#7f8c8d",
                    }}
                  >
                    Responder
                  </button>
                )}

              {comentarioRespondendo === comentario.id && (
                <div style={{ marginTop: "10px" }}>
                  <textarea
                    value={textoResposta}
                    onChange={(e) => setTextoResposta(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      minHeight: "60px",
                      resize: "vertical",
                    }}
                  />
                  <div
                    style={{ marginTop: "8px", display: "flex", gap: "8px" }}
                  >
                    <button
                      onClick={() => handleEnviarResposta(comentario.id)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "12px",
                      }}
                    >
                      Enviar
                    </button>
                    <button
                      onClick={() => {
                        setComentarioRespondendo(null);
                        setTextoResposta("");
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#e8e8e8",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {comentario.respostas && comentario.respostas.length > 0 && (
                <div
                  style={{
                    marginTop: "12px",
                    borderLeft: "2px solid #ddd",
                    paddingLeft: "12px",
                  }}
                >
                  {comentario.respostas.map((resposta) => (
                    <div key={resposta.id} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                        }}
                      >
                        {renderFotoPerfil(
                          resposta.usuario_foto,
                          resposta.usuario_nome,
                          "32px"
                        )}
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "600",
                              fontSize: "13px",
                            }}
                          >
                            {resposta.usuario_nome}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "#7f8c8d",
                            }}
                          >
                            @{resposta.usuario_nome_usuario}
                          </p>
                        </div>
                      </div>
                      <p
                        style={{
                          margin: "6px 0",
                          color: "#555",
                          fontSize: "13px",
                          lineHeight: "1.4",
                        }}
                      >
                        {resposta.mensagem}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      <Footer />

      {mostraModal && (
        <Modal
          desafioId={id}
          fecharModal={() => setMostraModal(false)}
          onPropostaEnviada={() => {
            setMostraModal(false);
            const response = api.get(`/desafios/${id}`);
            response.then((res) => {
              setDesafio(res.data.desafio);
            });
          }}
        />
      )}
    </div>
  );
}
