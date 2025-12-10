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
  isStaffViewingClient: boolean; // Ajuda a saber se é um Consultor olhando um cliente
};

const ActiveClientContext = createContext<ActiveClientContextData>(
  {} as ActiveClientContextData
);

export function ActiveClientProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [activeClientId, setActiveClientIdState] = useState<string | null>(
    null
  );

  // Lógica inteligente de inicialização
  useEffect(() => {
    // 1. Se for Cliente Final, o ID ativo é SEMPRE ele mesmo.
    if (profile?.userType === "client") {
      setActiveClientIdState(profile.id);
    }
    // 2. Se for Staff (Master/Consultor), tenta recuperar do localStorage ou inicia vazio
    else if (profile?.userType === "staff") {
      const savedId = localStorage.getItem("@avere:activeClient");
      if (savedId) setActiveClientIdState(savedId);
    }
  }, [profile]);

  // Função Wrapper para salvar no LocalStorage ao mudar
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
