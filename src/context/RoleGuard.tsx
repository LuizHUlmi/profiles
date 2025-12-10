// src/components/auth/RoleGuard.tsx

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spinner } from "../components/ui/spinner/Spinner";
import type { UserRole } from "../types/database";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: UserRole[]; // Lista de quem pode entrar (ex: ['master'])
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner fullScreen />;
  }

  // 1. Se não tem sessão, manda pro Login
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Se tem sessão mas o perfil não carregou (erro raro, mas possível)
  if (!profile) {
    // Pode mandar para uma tela de erro ou esperar
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        Erro ao carregar perfil.
      </div>
    );
  }

  // 3. Verificação de Role
  // Se o role do usuário NÃO estiver na lista de permitidos
  if (profile.role && !allowedRoles.includes(profile.role)) {
    // Redireciona para o Dashboard (ou uma página 403 Acesso Negado)
    return <Navigate to="/" replace />;
  }

  // 4. Se passou por tudo, renderiza a página
  return <>{children}</>;
}
