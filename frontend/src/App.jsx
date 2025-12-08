import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AutenticacaoModal from "./pages/AutenticacaoModal";
import VerifyEmail from "./pages/VerifyEmail";
import EsqueceuSenha from "./pages/EsqueceuSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Feed from "./pages/Feed";
import DetalhesDesafio from "./pages/DetalhesDesafio";
import CriarDesafio from "./pages/CriarDesafio";
import MinhasPropostas from "./pages/MinhasPropostas";
import Perfil from "./pages/Perfil";
import DashboardAdmin from "./pages/DashboardAdmin";
import EditarPerfil from "./pages/EditarPerfil";
import RotaProtegida from "./components/RotaProtegida";
import RotaAutenticacao from "./components/RotaAutenticacao";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<RotaAutenticacao />}>
            <Route path="/autenticacao" element={<AutenticacaoModal />} />
          </Route>

          <Route path="/verificar-email" element={<VerifyEmail />} />
          <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          <Route element={<RotaProtegida />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/desafio/:id" element={<DetalhesDesafio />} />
            <Route path="/criar-desafio" element={<CriarDesafio />} />
            <Route path="/minhas-propostas" element={<MinhasPropostas />} />
            <Route path="/perfil/:nomeUsuario" element={<Perfil />} />
            <Route path="/editar-perfil" element={<EditarPerfil />} />
            <Route path="/admin" element={<DashboardAdmin />} />
          </Route>

          <Route path="/" element={<Navigate to="/feed" />} />
          <Route path="*" element={<Navigate to="/feed" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
