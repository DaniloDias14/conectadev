"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CountdownTimer from "../components/CountdownTimer";

export default function Perfil() {
  const { nomeUsuario } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [desafios, setDesafios] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [desafiosParticipando, setDesafiosParticipando] = useState([]);
  const [desafiosVencidos, setDesafiosVencidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoDesafios, setCarregandoDesafios] = useState(true);
  const [erro, setErro] = useState("");
  const { usuario: usuarioLogado, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/autenticacao");
      return;
    }

    if (!nomeUsuario) {
      setErro("Perfil não encontrado");
      setCarregando(false);
      return;
    }

    const carregarPerfil = async () => {
      try {
        const response = await api.get(`/perfil/${nomeUsuario}`);
        const usuario = response.data.usuario;
        setUsuario(usuario);

        if (usuario.tipo === "contratante") {
          const desafiosResponse = await api.get(
            `/perfil/${nomeUsuario}/desafios`
          );
          setDesafios(desafiosResponse.data.desafios || []);
        }

        if (usuario.tipo === "proponente") {
          const vencidosResponse = await api.get(
            `/perfil/${nomeUsuario}/propostas-vencedoras`
          );
          setDesafiosVencidos(vencidosResponse.data.desafiosVencidos || []);

          if (usuario && usuario.id === usuarioLogado?.id) {
            try {
              const participandoResponse = await api.get(
                `/perfil/${nomeUsuario}/desafios-participando`
              );
              setDesafiosParticipando(
                participandoResponse.data.desafiosParticipando || []
              );
            } catch (err) {
              console.log(
                "[v0] Não foi possível carregar desafios participando"
              );
            }
          }
        }

        setCarregandoDesafios(false);
      } catch (err) {
        setErro(err.response?.data?.mensagem || "Erro ao carregar perfil");
        setCarregandoDesafios(false);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [nomeUsuario, usuarioLogado?.id]);

  const removerFoto = async () => {
    if (!window.confirm("Tem certeza que deseja remover sua foto de perfil?")) {
      return;
    }

    try {
      await api.delete("/perfil/foto");
      const response = await api.get(`/perfil/${nomeUsuario}`);
      setUsuario(response.data.usuario);
    } catch (err) {
      console.error("Erro ao remover foto:", err);
      alert("Erro ao remover foto de perfil");
    }
  };

  const baixarCurriculo = async () => {
    if (!usuario?.curriculo_pdf) return;

    try {
      const caminhoArquivo = usuario.curriculo_pdf.replace("public/", "");
      const url = `http://localhost:3001/${caminhoArquivo}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `curriculo_${usuario.nome_usuario}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erro ao baixar currículo:", err);
      alert("Erro ao baixar currículo. Verifique se o arquivo existe.");
    }
  };

  const renderFotoPerfil = (foto, nome, tamanho) => (
    <img
      src={`http://localhost:3001/${foto.replace("public/", "")}`}
      alt={nome}
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: "50%",
        objectFit: "cover",
        backgroundColor: "#f0f0f0",
        border: "2px solid #e8e8e8",
      }}
    />
  );

  if (carregando) {
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
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "16px", color: "#666" }}>
            Carregando perfil...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (erro) {
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
        <main style={{ flex: 1, padding: "20px", color: "#c00" }}>
          <div>
            <p>{erro}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!usuario) return null;

  const isOwnProfile = usuarioLogado?.id === usuario.id;

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
      <main style={{ flex: 1, padding: "30px 20px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
              marginBottom: "30px",
              display: "flex",
              gap: "35px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flexShrink: 0, position: "relative" }}>
              {usuario.foto_perfil ? (
                <img
                  src={`http://localhost:3001/${usuario.foto_perfil.replace(
                    "public/",
                    ""
                  )}`}
                  alt={usuario.nome}
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    backgroundColor: "#f0f0f0",
                    border: "3px solid #e8e8e8",
                    position: "absolute",
                  }}
                />
              ) : (
                <img
                  src="http://localhost:3001/FotoPerfil.jpg"
                  alt="Foto padrão"
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    backgroundColor: "#f0f0f0",
                    border: "3px solid #e8e8e8",
                    position: "absolute",
                  }}
                />
              )}
              {isOwnProfile && usuario.foto_perfil && (
                <button
                  onClick={removerFoto}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    padding: "6px 12px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  Remover
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <h1
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "32px",
                  color: "#2c3e50",
                }}
              >
                {usuario.nome}
              </h1>
              <p
                style={{
                  margin: "0 0 15px 0",
                  color: "#7f8c8d",
                  fontSize: "18px",
                }}
              >
                @{usuario.nome_usuario}
              </p>

              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  backgroundColor:
                    usuario.tipo === "contratante" ? "#e3f2fd" : "#f3e5f5",
                  color: usuario.tipo === "contratante" ? "#1976d2" : "#7b1fa2",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                {usuario.tipo === "contratante" ? "Contratante" : "Proponente"}
              </div>

              {isOwnProfile && (
                <p style={{ margin: "8px 0", color: "#555", fontSize: "15px" }}>
                  <strong>Email:</strong> {usuario.email}
                </p>
              )}

              {usuario.telefone && isOwnProfile && (
                <p style={{ margin: "8px 0", color: "#555", fontSize: "15px" }}>
                  <strong>Telefone:</strong> {usuario.telefone}
                </p>
              )}

              <p
                style={{ margin: "8px 0", color: "#7f8c8d", fontSize: "14px" }}
              >
                Membro desde{" "}
                {new Date(usuario.criado_em).toLocaleDateString("pt-BR")}
              </p>

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/editar-perfil")}
                  style={{
                    marginTop: "20px",
                    padding: "12px 24px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "15px",
                    fontWeight: "600",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#2980b9")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#3498db")
                  }
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>

          {usuario.tipo === "proponente" ? (
            <>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  marginBottom: "25px",
                }}
              >
                <h2
                  style={{ marginTop: 0, fontSize: "22px", color: "#2c3e50" }}
                >
                  Sobre
                </h2>
                <div
                  style={{
                    color: "#555",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    fontSize: "15px",
                  }}
                >
                  {usuario.bio || "Nenhuma bio adicionada ainda"}
                </div>
              </div>

              {usuario.curriculo_pdf && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                    marginBottom: "25px",
                  }}
                >
                  <h2
                    style={{ marginTop: 0, fontSize: "22px", color: "#2c3e50" }}
                  >
                    Currículo
                  </h2>
                  <button
                    onClick={baixarCurriculo}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 24px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "15px",
                      transition: "background-color 0.3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#229954")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#27ae60")
                    }
                  >
                    📄 Baixar Currículo (PDF)
                  </button>
                </div>
              )}

              {isOwnProfile && propostas.length > 0 && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  <h2
                    style={{ marginTop: 0, fontSize: "22px", color: "#2c3e50" }}
                  >
                    Minhas Propostas ({propostas.length})
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {propostas.map((proposta) => (
                      <div
                        key={proposta.id}
                        onClick={() =>
                          navigate(`/desafio/${proposta.desafio_id}`)
                        }
                        style={{
                          padding: "20px",
                          border: "2px solid #e8e8e8",
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          background: "#f9f9f9",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.12)";
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.borderColor = "#3498db";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.borderColor = "#e8e8e8";
                        }}
                      >
                        <h3
                          style={{
                            margin: "0 0 12px 0",
                            fontSize: "17px",
                            color: "#2c3e50",
                          }}
                        >
                          {proposta.titulo}
                        </h3>
                        <p
                          style={{
                            margin: "8px 0",
                            color: "#27ae60",
                            fontSize: "18px",
                            fontWeight: "700",
                          }}
                        >
                          R${" "}
                          {Number(proposta.valor).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          style={{
                            margin: "8px 0 0 0",
                            fontSize: "14px",
                            color: "#7f8c8d",
                          }}
                        >
                          Status:{" "}
                          <span
                            style={{
                              fontWeight: "600",
                              color:
                                proposta.desafio_status === "ativo"
                                  ? "#27ae60"
                                  : "#95a5a6",
                            }}
                          >
                            {proposta.desafio_status}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desafios Vencidos - Público */}
              {desafiosVencidos.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "15px",
                      color: "#27ae60",
                    }}
                  >
                    🏆 Desafios Vencidos ({desafiosVencidos.length})
                  </h2>
                  <div style={{ display: "grid", gap: "15px" }}>
                    {desafiosVencidos.map((desafio) => (
                      <div
                        key={desafio.id}
                        onClick={() => navigate(`/desafio/${desafio.id}`)}
                        style={{
                          backgroundColor: "#f9f9f9",
                          padding: "20px",
                          borderRadius: "8px",
                          border: "2px solid #27ae60",
                          cursor: "pointer",
                        }}
                      >
                        <h3 style={{ marginTop: 0, color: "#2c3e50" }}>
                          {desafio.titulo}
                        </h3>
                        <p
                          style={{
                            color: "#555",
                            fontSize: "14px",
                            marginBottom: "10px",
                          }}
                        >
                          {desafio.descricao.substring(0, 150)}...
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#27ae60",
                            }}
                          >
                            R${" "}
                            {Number(desafio.valor_vencedor).toLocaleString(
                              "pt-BR",
                              { minimumFractionDigits: 2 }
                            )}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {renderFotoPerfil(
                              desafio.contratante_foto,
                              desafio.contratante_nome,
                              "30px"
                            )}
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              {desafio.contratante_nome}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desafios Participando - Apenas para o próprio usuário */}
              {isOwnProfile && desafiosParticipando.length > 0 && (
                <div style={{ marginTop: "30px" }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      marginBottom: "15px",
                      color: "#3498db",
                    }}
                  >
                    📝 Desafios Participando ({desafiosParticipando.length})
                  </h2>
                  <div style={{ display: "grid", gap: "15px" }}>
                    {desafiosParticipando.map((desafio) => {
                      const estaExpirado =
                        new Date(desafio.expira_em) < new Date();
                      return (
                        <div
                          key={desafio.id}
                          onClick={() => navigate(`/desafio/${desafio.id}`)}
                          style={{
                            backgroundColor: "#f9f9f9",
                            padding: "20px",
                            borderRadius: "8px",
                            border: `2px solid ${
                              estaExpirado ? "#e74c3c" : "#3498db"
                            }`,
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            <h3 style={{ margin: 0, color: "#2c3e50" }}>
                              {desafio.titulo}
                            </h3>
                            {!estaExpirado && (
                              <CountdownTimer
                                expiraEm={desafio.expira_em}
                                tamanho="small"
                              />
                            )}
                            {estaExpirado && (
                              <span
                                style={{
                                  color: "#e74c3c",
                                  fontWeight: "600",
                                  fontSize: "12px",
                                }}
                              >
                                ⏱ Aguardando resultado
                              </span>
                            )}
                          </div>
                          <p
                            style={{
                              color: "#555",
                              fontSize: "14px",
                              marginBottom: "10px",
                            }}
                          >
                            {desafio.descricao.substring(0, 150)}...
                          </p>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#3498db",
                              }}
                            >
                              Minha proposta: R${" "}
                              {Number(
                                desafio.minha_proposta_valor
                              ).toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              {renderFotoPerfil(
                                desafio.contratante_foto,
                                desafio.contratante_nome,
                                "30px"
                              )}
                              <span style={{ fontSize: "14px", color: "#666" }}>
                                {desafio.contratante_nome}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "30px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  marginBottom: "25px",
                }}
              >
                <h2
                  style={{ marginTop: 0, fontSize: "22px", color: "#2c3e50" }}
                >
                  Sobre
                </h2>
                <div
                  style={{
                    color: "#555",
                    lineHeight: "1.7",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    fontSize: "15px",
                  }}
                >
                  {usuario.bio || "Nenhuma bio adicionada ainda"}
                </div>
              </div>

              {desafios.length > 0 && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  }}
                >
                  <h2
                    style={{ marginTop: 0, fontSize: "22px", color: "#2c3e50" }}
                  >
                    {isOwnProfile ? "Meus Desafios" : "Desafios Publicados"} (
                    {desafios.length})
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {desafios.map((desafio) => {
                      const estaExpirado =
                        new Date(desafio.expira_em) < new Date();
                      const estaAtivo =
                        desafio.status === "ativo" && !estaExpirado;

                      let caracteristicas = [];
                      try {
                        caracteristicas = JSON.parse(
                          desafio.caracteristicas || "[]"
                        );
                      } catch (e) {
                        caracteristicas = [];
                      }

                      return (
                        <div
                          key={desafio.id}
                          onClick={() => navigate(`/desafio/${desafio.id}`)}
                          style={{
                            padding: "20px",
                            border: "2px solid #e8e8e8",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.3s",
                            background: "#f9f9f9",
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0,0,0,0.12)";
                            e.currentTarget.style.transform =
                              "translateY(-3px)";
                            e.currentTarget.style.borderColor = "#3498db";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "#e8e8e8";
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              padding: "4px 10px",
                              backgroundColor: estaAtivo
                                ? "#d4edda"
                                : "#f8d7da",
                              color: estaAtivo ? "#155724" : "#721c24",
                              borderRadius: "12px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            {estaAtivo
                              ? "Ativo"
                              : estaExpirado
                              ? "Expirado"
                              : desafio.status}
                          </div>

                          <h3
                            style={{
                              margin: "0 0 12px 0",
                              fontSize: "17px",
                              color: "#2c3e50",
                              paddingRight: "60px",
                            }}
                          >
                            {desafio.titulo}
                          </h3>

                          {caracteristicas.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                marginBottom: "12px",
                              }}
                            >
                              {caracteristicas.slice(0, 3).map((tech, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    backgroundColor: "#e3f2fd",
                                    color: "#1976d2",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                    fontWeight: "500",
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                              {caracteristicas.length > 3 && (
                                <span
                                  style={{
                                    backgroundColor: "#f5f5f5",
                                    color: "#666",
                                    padding: "3px 8px",
                                    borderRadius: "10px",
                                    fontSize: "11px",
                                  }}
                                >
                                  +{caracteristicas.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <p
                            style={{
                              margin: "12px 0 0 0",
                              fontSize: "18px",
                              fontWeight: "700",
                              color: "#27ae60",
                            }}
                          >
                            R${" "}
                            {Number(desafio.orcamento).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
