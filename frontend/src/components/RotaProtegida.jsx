"use client";

import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RotaProtegida() {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
    );
  }

  if (!usuario) {
    return <Navigate to="/autenticacao" replace />;
  }

  return <Outlet />;
}
