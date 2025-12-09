// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Equipe } from "./pages/Equipe";
import { Login } from "./pages/Login"; // Importe a página de Login
import { AuthProvider, useAuth } from "./context/AuthContext"; // Importe o Contexto
import type { JSX } from "react";
import { Clientes } from "./pages/Clientes";

// Componente "Porteiro"
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, loading } = useAuth();

  if (loading) return <div>Carregando...</div>; // Ou um Spinner bonito

  if (!session) {
    // Se não tem sessão, manda pro login
    return <Navigate to="/login" replace />;
  }

  // Se tem sessão, libera o acesso
  return children;
}

function App() {
  return (
    // 1. Envolvemos tudo no AuthProvider
    <AuthProvider>
      <Routes>
        {/* Rota Pública */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Protegidas (Layout Principal) */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/Cliente" element={<Clientes />} />
          <Route path="/Equipe" element={<Equipe />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
