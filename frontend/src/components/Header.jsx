"use client";

import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Header() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [sugestoes, setSugestoes] = useState([]);
  const [mostraSugestoes, setMostraSugestoes] = useState(false);
  const refBusca = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca.length >= 1) {
        buscarUsuarios();
      } else {
        setSugestoes([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  const buscarUsuarios = async () => {
    try {
      const response = await api.get("/perfil/busca/usuarios", {
        params: { q: busca },
      });
      setSugestoes(response.data.usuarios || []);
    } catch (erro) {
      console.error("Erro ao buscar usuários:", erro);
    }
  };

  const handleSugestaoClick = (nomeUsuario) => {
    navigate(`/perfil/${nomeUsuario}`);
    setBusca("");
    setSugestoes([]);
    setMostraSugestoes(false);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleClickFora = (e) => {
      if (refBusca.current && !refBusca.current.contains(e.target)) {
        setMostraSugestoes(false);
      }
    };

    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <header
      style={{
        backgroundColor: "#2c3e50",
        color: "white",
        padding: "15px 20px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{ margin: 0, fontSize: "24px", cursor: "pointer" }}
          onClick={() => navigate("/feed")}
        >
          ConectaDev
        </h1>

        <div
          ref={refBusca}
          style={{
            position: "relative",
            flex: 1,
            minWidth: "250px",
            maxWidth: "400px",
          }}
        >
          <input
            type="text"
            placeholder="Buscar por nome ou @username..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setMostraSugestoes(true);
            }}
            onFocus={() => setMostraSugestoes(true)}
            style={{
              width: "100%",
              padding: "10px 15px",
              borderRadius: "4px",
              border: "none",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />

          {mostraSugestoes && sugestoes.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                color: "#333",
                borderRadius: "4px",
                marginTop: "5px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                zIndex: 100,
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {sugestoes.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSugestaoClick(user.nome_usuario)}
                  style={{
                    padding: "10px 15px",
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f5f5f5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  {user.foto_perfil && (
                    <img
                      src={user.foto_perfil || "/placeholder.svg"}
                      alt={user.nome}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div>
                    <strong style={{ display: "block" }}>{user.nome}</strong>
                    <small style={{ color: "#007bff" }}>
                      @{user.nome_usuario}
                    </small>
                    <small style={{ color: "#666", marginLeft: "10px" }}>
                      {user.tipo === "contratante"
                        ? "Contratante"
                        : "Proponente"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <nav style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {usuario ? (
            <>
              <span style={{ fontSize: "14px" }}>Olá, {usuario.nome}!</span>
              <button
                onClick={() => navigate(`/perfil/${usuario.nome_usuario}`)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "transparent",
                  color: "white",
                  border: "1px solid white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Sair
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
