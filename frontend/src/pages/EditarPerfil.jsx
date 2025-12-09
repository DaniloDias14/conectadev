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

  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [curriculoFile, setCurriculoFile] = useState(null);
  const [curriculoAtual, setCurriculoAtual] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/autenticacao");
      return;
    }

    const carregarPerfil = async () => {
      try {
        const response = await api.get(
          `/perfil/${usuarioLogado?.nome_usuario}`
        );
        const usuario = response.data.usuario;

        setFormData({
          nome: usuario.nome || "",
          bio: usuario.bio || "",
          telefone: usuario.telefone || "",
          curriculo_pdf: usuario.curriculo_pdf || "",
        });

        if (usuario.foto_perfil) {
          setFotoPreview(
            `http://localhost:3001/${usuario.foto_perfil.replace(
              "public/",
              ""
            )}`
          );
        } else {
          setFotoPreview("/FotoPerfil.jpg");
        }

        if (usuario.curriculo_pdf) {
          setCurriculoAtual(usuario.curriculo_pdf);
        }
      } catch (err) {
        setErro("Erro ao carregar perfil");
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarPerfil();
  }, [token, navigate, usuarioLogado?.nome_usuario]);

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    if (apenasNumeros.length === 0) return "";
    if (apenasNumeros.length <= 2) return `(${apenasNumeros}`;
    if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    }
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(
      2,
      7
    )}-${apenasNumeros.slice(7, 11)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefone") {
      const telefoneFomatado = formatarTelefone(value);
      setFormData((prev) => ({
        ...prev,
        [name]: telefoneFomatado,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurriculoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setCurriculoFile(file);
      setMensagem("Novo currículo selecionado");
      setErro("");
    } else {
      setErro("Por favor, selecione um arquivo PDF válido");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nome", formData.nome);
      formDataToSend.append("bio", formData.bio);
      formDataToSend.append("telefone", formData.telefone);

      if (fotoFile) {
        formDataToSend.append("foto_perfil", fotoFile);
      }

      if (curriculoFile) {
        formDataToSend.append("curriculo_pdf", curriculoFile);
      }

      const response = await api.put("/perfil", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMensagem("Perfil atualizado com sucesso!");
      setTimeout(() => {
        navigate(`/perfil/${response.data.usuario.nome_usuario}`);
      }, 1500);
    } catch (err) {
      const mensagemErro =
        err.response?.data?.mensagem || "Erro ao atualizar perfil";
      setErro(mensagemErro);
      console.error("Erro ao atualizar perfil:", err);
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
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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

            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                <img
                  src={fotoPreview || "/FotoPerfil.jpg"}
                  alt="Preview"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    marginBottom: "10px",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.src = "/FotoPerfil.jpg";
                  }}
                />
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

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Nome
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
                <small style={{ color: "#666" }}>Seu nome completo</small>
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

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Sobre mim
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    minHeight: "150px",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    resize: "vertical",
                  }}
                  placeholder="Conte um pouco sobre você, suas habilidades e experiências..."
                />
                <small style={{ color: "#666" }}>
                  Escreva livremente sobre você, suas habilidades e
                  experiências.
                </small>
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

                  {curriculoAtual && (
                    <div
                      style={{
                        marginBottom: "15px",
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Você já possui um currículo cadastrado
                      </p>
                    </div>
                  )}

                  <p
                    style={{
                      margin: "10px 0 8px 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    {curriculoAtual
                      ? "Enviar novo currículo (substituirá o atual):"
                      : "Enviar currículo:"}
                  </p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleCurriculoChange}
                    style={{
                      padding: "10px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <small style={{ color: "#666" }}>
                    Apenas arquivos PDF - Máximo 10MB
                  </small>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "30px",
                }}
              >
                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: salvando ? "#6c757d" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: salvando ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {salvando ? "Salvando..." : "Salvar Alterações"}
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
