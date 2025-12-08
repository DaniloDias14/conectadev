"use client";

import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenArmazenado = localStorage.getItem("accessToken");
    const usuarioArmazenado = localStorage.getItem("usuario");

    if (tokenArmazenado && usuarioArmazenado) {
      try {
        const usuarioParsed = JSON.parse(usuarioArmazenado);
        setToken(tokenArmazenado);
        setUsuario(usuarioParsed);
      } catch (err) {
        console.error("Erro ao parsear usuário armazenado:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("usuario");
      }
    }

    setCarregando(false);
  }, []);

  const login = (usuarioData, accessToken) => {
    setUsuario(usuarioData);
    setToken(accessToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("usuario");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
