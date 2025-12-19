import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

type ActiveClientContextType = {
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
};

const ActiveClientContext = createContext<ActiveClientContextType>({
  activeClientId: null,
  setActiveClientId: () => {},
});

export function ActiveClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading } = useAuth();
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) {
      if (profile.userType === "client") {
        // Se for cliente, trava no ID dele
        setActiveClientId(profile.id);
      } else {
        // Se for staff (master/consultor), começa NULO para obrigar a seleção
        // A menos que você queira persistir a seleção no localStorage, aqui é o lugar de limpar
        setActiveClientId(null);
      }
    }
  }, [profile, loading]);

  return (
    <ActiveClientContext.Provider value={{ activeClientId, setActiveClientId }}>
      {children}
    </ActiveClientContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useActiveClient = () => useContext(ActiveClientContext);
