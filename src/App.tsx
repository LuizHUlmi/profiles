// src/App.tsx

import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/mainLayout/MainLayout";
import { Futuro } from "./pages/Futuro";
import { Equipe } from "./pages/Equipe";
import { Login } from "./pages/Login";
import { Clientes } from "./pages/Clientes";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/toast/ToastContext";
import { RoleGuard } from "./context/RoleGuard";
import { Perfil } from "./pages/Perfil";
import { ActiveClientProvider } from "./context/ActiveClientContext";
import { EntradasSaidas } from "./pages/EntradasSaidas";
import { AtivosPassivos } from "./pages/AtivosPassivos";
import { Protecao } from "./pages/Protecao";
import { Educacao } from "./pages/Educacao";
import { Parametros } from "./pages/Parametros";

function App() {
  return (
    <AuthProvider>
      <ActiveClientProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<MainLayout />}>
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
                    <Futuro />
                  </RoleGuard>
                }
              />

              <Route
                path="/entradas-saidas"
                element={
                  <RoleGuard
                    allowedRoles={["master", "consultor", "cliente_editor"]}
                  >
                    <EntradasSaidas />
                  </RoleGuard>
                }
              />

              <Route
                path="/ativos-passivos"
                element={
                  <RoleGuard
                    allowedRoles={["master", "consultor", "cliente_editor"]}
                  >
                    <AtivosPassivos />
                  </RoleGuard>
                }
              />

              <Route
                path="/protecao"
                element={
                  <RoleGuard
                    allowedRoles={["master", "consultor", "cliente_editor"]}
                  >
                    <Protecao />
                  </RoleGuard>
                }
              />
              {/* ====================== */}

              {/* ... resto das rotas (futuro/:userId, cliente, equipe, etc) ... */}
              <Route
                path="/futuro/:userId"
                element={
                  <RoleGuard allowedRoles={["master", "consultor"]}>
                    <Futuro />
                  </RoleGuard>
                }
              />

              <Route
                path="/cliente"
                element={
                  <RoleGuard allowedRoles={["master", "consultor"]}>
                    <Clientes />
                  </RoleGuard>
                }
              />

              <Route
                path="/educacao"
                element={
                  <RoleGuard
                    allowedRoles={["master", "consultor", "cliente_editor"]}
                  >
                    <Educacao />
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

              {/* Rotas Administrativas */}
              <Route
                path="/parametros"
                element={
                  <RoleGuard allowedRoles={["master"]}>
                    <Parametros />
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
