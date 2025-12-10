// src/context/ToastContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import styles from "./Toast.module.css";

// Tipos
type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now();

      const newToast = { id, type, message };

      // Pequena melhoria: Evita adicionar toast duplicado se a mensagem for idêntica e recente
      setToasts((state) => {
        const exists = state.find(
          (t) => t.message === message && t.type === type
        );
        if (exists) return state;
        return [...state, newToast];
      });

      setTimeout(() => {
        removeToast(id);
      }, 3000);
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string) => addToast("success", msg),
    [addToast]
  );
  const error = useCallback(
    (msg: string) => addToast("error", msg),
    [addToast]
  );
  const info = useCallback((msg: string) => addToast("info", msg), [addToast]);

  // --- CORREÇÃO DO LOOP INFINITO ---
  // Memorizamos o valor do contexto para que ele não mude a cada renderização
  const contextValue = useMemo(
    () => ({
      addToast,
      success,
      error,
      info,
    }),
    [addToast, success, error, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]}`}
          >
            <span className={styles.message}>{toast.message}</span>
            <button
              className={styles.closeButton}
              onClick={() => removeToast(toast.id)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- CORREÇÃO DO ERRO ESLINT (Fast Refresh) ---
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
