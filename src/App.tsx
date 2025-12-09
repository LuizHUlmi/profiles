// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/mainLayout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Equipe } from "./pages/Equipe";
import { Login } from "./pages/Login";
import { Clientes } from "./pages/Clientes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui/spinner/Spinner"; // <--- Import novo

// Componente "Porteiro" atualizado
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Ajustei o tipo para React.ReactNode (mais genérico)
  const { session, loading } = useAuth();

  if (loading) {
    // Agora mostramos o Spinner de tela cheia enquanto verifica o login
    return <Spinner fullScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>; // Fragmento para garantir tipo correto
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/cliente" element={<Clientes />} />
          <Route path="/equipe" element={<Equipe />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
