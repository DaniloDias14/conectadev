import api from "./api";

export const cadastro = async (nome, email, senha, tipo, nomeUsuario) => {
  const response = await api.post("/auth/registro", {
    nome,
    email,
    senha,
    tipo,
    nomeUsuario,
  });
  return response.data;
};

export const login = async (credencial, senha) => {
  const response = await api.post("/auth/login", {
    credencial,
    senha,
  });
  return response.data;
};

export const verificarEmail = async (token) => {
  const response = await api.post("/auth/verificar-email", { token });
  return response.data;
};

export const esqueceuSenha = async (email) => {
  const response = await api.post("/auth/esqueceu-senha", { email });
  return response.data;
};

export const redefinirSenha = async (token, novaSenha) => {
  const response = await api.post("/auth/redefinir-senha", {
    token,
    novaSenha,
  });
  return response.data;
};

export const logout = async () => {
  await api.post("/auth/logout");
};
