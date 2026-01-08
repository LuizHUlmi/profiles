// src/context/ActiveClientContext.tsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

type ActiveClientContextData = {
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  isStaffViewingClient: boolean;
};

const ActiveClientContext = createContext<ActiveClientContextData>(
  {} as ActiveClientContextData
);

export function ActiveClientProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();

  // ALTERAÇÃO PRINCIPAL:
  // Inicializamos o estado JÁ lendo do localStorage.
  // Isso garante que o ID esteja disponível no primeiro milissegundo,
  // antes mesmo do useEffect rodar ou da Navbar renderizar os options.
  const [activeClientId, setActiveClientIdState] = useState<string | null>(
    () => {
      const saved = localStorage.getItem("@avere:activeClient");
      return saved || null;
    }
  );

  // useEffect agora serve apenas para REGRAS DE NEGÓCIO (segurança/tipo)
  useEffect(() => {
    // 1. Se for Cliente Final, forçamos o ID ser ele mesmo (sobrescreve o storage se estiver errado)
    if (profile?.userType === "client") {
      if (activeClientId !== profile.id) {
        setActiveClientIdState(profile.id);
      }
    }
    // 2. Se for Staff, não precisamos fazer nada aqui, pois o useState já carregou do Storage.
    // Opcional: Se quiser limpar o storage quando fizer logout (profile null), pode tratar aqui.
  }, [profile, activeClientId]);

  // Mantemos a função wrapper igual
  const setActiveClientId = (id: string | null) => {
    setActiveClientIdState(id);
    if (id) {
      localStorage.setItem("@avere:activeClient", id);
    } else {
      localStorage.removeItem("@avere:activeClient");
    }
  };

  const isStaffViewingClient = !!(
    profile?.userType === "staff" && activeClientId
  );

  return (
    <ActiveClientContext.Provider
      value={{ activeClientId, setActiveClientId, isStaffViewingClient }}
    >
      {children}
    </ActiveClientContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveClient() {
  return useContext(ActiveClientContext);
}
