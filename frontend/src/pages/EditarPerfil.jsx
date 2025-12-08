"use client";

import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { usuario: usuarioLogado, token } = useContext(AuthContext);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    bio: "",
    telefone: "",
    curriculo_pdf: "",
  });

  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const carregarPerfil = async () => {
      try {
        const response = await api.get(`/perfil/${usuarioLogado.nome}`);
        const usuario = response.data.usuario;

        setFormData({
          nome: usuario.nome || "",
          bio: usuario.bio || "",
          telefone: usuario.telefone || "",
          curriculo_pdf: usuario.curriculo_pdf || "",
        });

        if (usuario.foto_perfil) {
          setFotoPreview(usuario.foto_perfil);
        }
      } catch (err) {
        setErro("Erro ao carregar perfil");
        console.error(err);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [token, navigate, usuarioLogado]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload de foto (em produção, seria enviado para servidor)
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurriculoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simular upload de currículo
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          curriculo_pdf: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const response = await api.put("/perfil", formData);

      setMensagem("Perfil atualizado com sucesso!");
      setTimeout(() => {
        navigate(`/perfil/${response.data.usuario.nome}`);
      }, 1500);
    } catch (err) {
      setErro(err.response?.data?.mensagem || "Erro ao atualizar perfil");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

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
          <div>Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main style={{ flex: 1, padding: "20px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
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
            }}
          >
            <h1 style={{ marginTop: 0 }}>Editar Perfil</h1>

            {mensagem && (
              <div
                style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                {mensagem}
              </div>
            )}

            {erro && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "20px",
                }}
              >
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Foto de Perfil */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Foto de Perfil
                </label>
                {fotoPreview && (
                  <img
                    src={fotoPreview || "/placeholder.svg"}
                    alt="Preview"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      marginBottom: "10px",
                      display: "block",
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  style={{
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <small style={{ color: "#666" }}>JPG, PNG - Máximo 5MB</small>
              </div>

              {/* Nome de Usuário */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Nome de Usuário
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                  }}
                  required
                />
                <small style={{ color: "#666" }}>
                  Este nome será usado na URL do seu perfil
                </small>
              </div>

              {/* Bio */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                    minHeight: "120px",
                    fontFamily: "inherit",
                  }}
                  placeholder="Fale um pouco sobre você..."
                />
                <small style={{ color: "#666" }}>Máximo 500 caracteres</small>
              </div>

              {/* Telefone */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                  }}
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              {/* Currículo (apenas para proponentes) */}
              {usuarioLogado?.tipo === "proponente" && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    Currículo (PDF)
                  </label>
                  {formData.curriculo_pdf && (
                    <div style={{ marginBottom: "10px" }}>
                      <a
                        href={formData.curriculo_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          padding: "8px 12px",
                          backgroundColor: "#28a745",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                          fontSize: "14px",
                        }}
                      >
                        Ver Currículo Atual
                      </a>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCurriculoChange}
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <small style={{ color: "#666" }}>PDF - Máximo 10MB</small>
                </div>
              )}

              {/* Botões */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: salvando ? "not-allowed" : "pointer",
                    opacity: salvando ? 0.6 : 1,
                    fontWeight: "bold",
                  }}
                >
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
