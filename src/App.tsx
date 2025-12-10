// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/mainLayout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Equipe } from "./pages/Equipe";
import { Login } from "./pages/Login";
import { Clientes } from "./pages/Clientes";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast/ToastContext";
import { RoleGuard } from "./context/RoleGuard";
import { Perfil } from "./pages/Perfil";
import { ActiveClientProvider } from "./context/ActiveClientContext";

function App() {
  return (
    <AuthProvider>
      <ActiveClientProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<MainLayout />}>
              {/* Rota Padrão (Para o Cliente ver o próprio) */}
              <Route
                path="/"
                element={
                  <RoleGuard
                    allowedRoles={[
                      "master",
                      "consultor",
                      "cliente_leitor",
                      "cliente_editor",
                    ]}
                  >
                    <Dashboard />
                  </RoleGuard>
                }
              />

              {/* NOVA ROTA: Dashboard Visualizando um Cliente Específico */}
              <Route
                path="/dashboard/:userId"
                element={
                  <RoleGuard allowedRoles={["master", "consultor"]}>
                    <Dashboard />
                  </RoleGuard>
                }
              />

              {/* ... rotas de clientes e equipe ... */}
              <Route
                path="/cliente"
                element={
                  <RoleGuard allowedRoles={["master", "consultor"]}>
                    <Clientes />
                  </RoleGuard>
                }
              />

              <Route
                path="/equipe"
                element={
                  <RoleGuard allowedRoles={["master"]}>
                    <Equipe />
                  </RoleGuard>
                }
              />

              <Route
                path="/perfil"
                element={
                  <RoleGuard
                    allowedRoles={[
                      "master",
                      "consultor",
                      "cliente_leitor",
                      "cliente_editor",
                    ]}
                  >
                    <Perfil />
                  </RoleGuard>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ActiveClientProvider>
    </AuthProvider>
  );
}

export default App;
