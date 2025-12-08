"use client";

import { useState, useEffect, useContext, useRef } from "react";
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

  const editorRef = useRef(null);
  const [editorState, setEditorState] = useState({
    negrito: false,
    titulo: false,
    alinhamento: "left",
  });

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
          setFotoPreview(usuario.foto_perfil);
        }

        if (usuario.curriculo_pdf) {
          setCurriculoAtual(usuario.curriculo_pdf);
        }
      } catch (err) {
        setErro("Erro ao carregar perfil");
        console.error("[v0] Erro ao carregar perfil:", err);
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

  const aplicarFormatacao = (tipo) => {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (tipo === "negrito") {
      document.execCommand("bold", false, null);
    } else if (tipo === "titulo") {
      document.execCommand("formatBlock", false, "<h3>");
    } else if (tipo.startsWith("align")) {
      const alinhamento = tipo.replace("align-", "");
      const comandoAlinhamento = {
        left: "left",
        center: "center",
        right: "right",
        justify: "justify",
      }[alinhamento];
      document.execCommand(
        "align" +
          comandoAlinhamento.charAt(0).toUpperCase() +
          comandoAlinhamento.slice(1),
        false,
        null
      );

      setEditorState((prev) => ({
        ...prev,
        alinhamento,
      }));
    }

    editor?.focus();
  };

  const handleEditorInput = () => {
    const editor = editorRef.current;
    setFormData((prev) => ({
      ...prev,
      bio: editor.innerHTML,
    }));
  };

  const handleEditorMouseUp = () => {
    const editor = editorRef.current;
    setFormData((prev) => ({
      ...prev,
      bio: editor.innerHTML,
    }));

    setEditorState((prev) => ({
      ...prev,
      negrito: document.queryCommandState("bold"),
      titulo: document.queryCommandState("formatBlock") === "h3",
    }));
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
      console.error("[v0] Erro ao atualizar perfil:", err);
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
                  Bio
                </label>

                {/* Barra de ferramentas */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "10px",
                    padding: "8px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("negrito")}
                    title="Negrito (Ctrl+B)"
                    style={{
                      padding: "6px 10px",
                      backgroundColor: editorState.negrito
                        ? "#007bff"
                        : "#e9ecef",
                      color: editorState.negrito ? "white" : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    <strong>N</strong>
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("titulo")}
                    title="Título"
                    style={{
                      padding: "6px 10px",
                      backgroundColor: editorState.titulo
                        ? "#007bff"
                        : "#e9ecef",
                      color: editorState.titulo ? "white" : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    H3
                  </button>

                  <div
                    style={{
                      width: "1px",
                      height: "24px",
                      backgroundColor: "#ddd",
                    }}
                  />

                  {/* Alinhamento */}
                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("align-left")}
                    title="Alinhar à esquerda"
                    style={{
                      padding: "6px 10px",
                      backgroundColor:
                        editorState.alinhamento === "left"
                          ? "#007bff"
                          : "#e9ecef",
                      color:
                        editorState.alinhamento === "left" ? "white" : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ⬅️
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("align-center")}
                    title="Centralizar"
                    style={{
                      padding: "6px 10px",
                      backgroundColor:
                        editorState.alinhamento === "center"
                          ? "#007bff"
                          : "#e9ecef",
                      color:
                        editorState.alinhamento === "center"
                          ? "white"
                          : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ⬇️⬆️
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("align-right")}
                    title="Alinhar à direita"
                    style={{
                      padding: "6px 10px",
                      backgroundColor:
                        editorState.alinhamento === "right"
                          ? "#007bff"
                          : "#e9ecef",
                      color:
                        editorState.alinhamento === "right" ? "white" : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ➡️
                  </button>

                  <button
                    type="button"
                    onClick={() => aplicarFormatacao("align-justify")}
                    title="Justificar"
                    style={{
                      padding: "6px 10px",
                      backgroundColor:
                        editorState.alinhamento === "justify"
                          ? "#007bff"
                          : "#e9ecef",
                      color:
                        editorState.alinhamento === "justify"
                          ? "white"
                          : "black",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ≡
                  </button>
                </div>

                {/* Editor contenteditable */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onMouseUp={handleEditorMouseUp}
                  onKeyUp={handleEditorMouseUp}
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    padding: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    lineHeight: "1.6",
                    outline: "none",
                    overflowY: "auto",
                  }}
                  dangerouslySetInnerHTML={{ __html: formData.bio }}
                />
                <small
                  style={{ color: "#666", display: "block", marginTop: "8px" }}
                >
                  {formData.bio.length}/1000 caracteres
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
                    <div style={{ marginBottom: "10px" }}>
                      <p
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Currículo atual:
                      </p>
                      <a
                        href={curriculoAtual}
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
                        Baixar Currículo Atual
                      </a>
                    </div>
                  )}

                  <p
                    style={{
                      margin: "10px 0 8px 0",
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    Enviar novo currículo:
                  </p>
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
