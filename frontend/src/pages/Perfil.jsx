"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Perfil() {
  const { nomeUsuario } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [desafios, setDesafios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const { usuario: usuarioLogado, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const carregarPerfil = async () => {
      try {
        const response = await api.get(`/perfil/${nomeUsuario}`);
        setUsuario(response.data.usuario);

        if (response.data.usuario.tipo === "contratante") {
          const desafiosResponse = await api.get(
            `/perfil/${nomeUsuario}/desafios`
          );
          setDesafios(desafiosResponse.data.desafios || []);
        }
      } catch (err) {
        setErro("Perfil não encontrado");
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [nomeUsuario, token, navigate]);

  if (carregando) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
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
          <div>Carregando perfil...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (erro) {
    return (
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1, padding: "20px", color: "#c00" }}>
          <div>
            <p>{erro}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Voltar
            </button>
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
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main style={{ flex: 1, padding: "20px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <button
            onClick={() => navigate(-1)}
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
            Voltar
          </button>

          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              marginBottom: "20px",
              display: "flex",
              gap: "30px",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flexShrink: 0 }}>
              <img
                src={
                  usuario.foto_perfil ||
                  "/placeholder.svg?height=150&width=150&query=silhueta de usuário"
                }
                alt={usuario.nome}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  backgroundColor: "#f0f0f0",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ margin: "0 0 5px 0" }}>{usuario.nome}</h1>
              <p
                style={{
                  margin: "0 0 10px 0",
                  color: "#007bff",
                  fontSize: "16px",
                }}
              >
                @{usuario.nome_usuario}
              </p>

              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Tipo de Usuário:</strong>{" "}
                {usuario.tipo === "contratante" ? "Contratante" : "Proponente"}
              </p>

              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Email:</strong> {usuario.email}
              </p>

              {usuario.telefone && (
                <p style={{ margin: "5px 0", color: "#666" }}>
                  <strong>Telefone:</strong> {usuario.telefone}
                </p>
              )}

              <p style={{ margin: "5px 0", color: "#666" }}>
                <strong>Membro desde:</strong>{" "}
                {new Date(usuario.criado_em).toLocaleDateString("pt-BR")}
              </p>

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/editar-perfil")}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
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
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Sobre</h2>
                <p style={{ color: "#666", lineHeight: "1.6" }}>
                  {usuario.bio || "Nenhuma bio adicionada ainda"}
                </p>
              </div>

              {usuario.curriculo_pdf && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>Currículo</h2>
                  <a
                    href={usuario.curriculo_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 20px",
                      backgroundColor: "#28a745",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                    }}
                  >
                    Baixar Currículo (PDF)
                  </a>
                </div>
              )}
            </>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "20px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Sobre</h2>
                <p
                  style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}
                >
                  {usuario.bio || "Nenhuma bio adicionada ainda"}
                </p>
              </div>

              {desafios.length > 0 && (
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                  }}
                >
                  <h2 style={{ marginTop: 0 }}>
                    Desafios Publicados ({desafios.length})
                  </h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {desafios.map((desafio) => (
                      <div
                        key={desafio.id}
                        onClick={() => navigate(`/desafio/${desafio.id}`)}
                        style={{
                          padding: "15px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.3s",
                          background: desafio.ativo ? "#f9f9f9" : "#f0f0f0",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.15)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                          {desafio.titulo}
                        </h3>
                        <p
                          style={{
                            margin: "5px 0",
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          {desafio.descricao?.substring(0, 100)}...
                        </p>
                        <p style={{ margin: "10px 0 0 0", fontSize: "14px" }}>
                          <strong>Orçamento:</strong> R${" "}
                          {desafio.orcamento?.toLocaleString("pt-BR")}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "10px",
                            padding: "4px 8px",
                            backgroundColor: desafio.ativo
                              ? "#28a745"
                              : "#6c757d",
                            color: "white",
                            borderRadius: "3px",
                            fontSize: "12px",
                          }}
                        >
                          {desafio.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    ))}
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
