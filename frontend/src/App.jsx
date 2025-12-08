import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import EsqueceuSenha from "./pages/EsqueceuSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Feed from "./pages/Feed";
import DetalhesDesafio from "./pages/DetalhesDesafio";
import CriarDesafio from "./pages/CriarDesafio";
import MinhasPropostas from "./pages/MinhasPropostas";
import Perfil from "./pages/Perfil";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardContratante from "./pages/DashboardContratante";
import DashboardProponente from "./pages/DashboardProponente";
import EditarPerfil from "./pages/EditarPerfil";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/desafio/:id" element={<DetalhesDesafio />} />
          <Route path="/criar-desafio" element={<CriarDesafio />} />
          <Route path="/minhas-propostas" element={<MinhasPropostas />} />
          <Route path="/perfil/:id" element={<Perfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/admin" element={<DashboardAdmin />} />
          <Route
            path="/dashboard-contratante"
            element={<DashboardContratante />}
          />
          <Route
            path="/dashboard-proponente"
            element={<DashboardProponente />}
          />
          <Route path="/" element={<Navigate to="/feed" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
