// src/contexts/AuthContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../types/database";

type UserType = "staff" | "cliente";

type UserProfile = {
  id: string;
  nome: string;
  role?: UserRole;
  userType: UserType;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

// --- MUDANÇA AQUI: Remova o 'export' desta linha ---
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // 1. Busca na tabela de CONSULTORES
      const { data: consultor } = await supabase
        .from("consultores")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (consultor) {
        setProfile({
          id: consultor.id,
          nome: consultor.nome,
          role: consultor.nivel,
          userType: "staff",
        });
        return;
      }

      // 2. Busca na tabela de PERFIS
      const { data: cliente } = await supabase
        .from("perfis")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (cliente) {
        setProfile({
          id: cliente.id,
          nome: cliente.nome,
          userType: "cliente",
        });
      }
    } catch (error) {
      console.error("Erro perfil:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchProfile(session.user.id, session.user.email).then(() =>
          setLoading(false)
        );
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        setLoading(true);
        fetchProfile(session.user.id, session.user.email).then(() =>
          setLoading(false)
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// O Hook continua sendo exportado
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
