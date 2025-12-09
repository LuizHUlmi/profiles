// src/components/ui/Input.tsx

import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

// Estendemos as props padrão do HTML Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

// O segredo está aqui: forwardRef
// O primeiro tipo (HTMLInputElement) é o que a ref vai apontar
// O segundo tipo (InputProps) são as props que o componente aceita
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, name, ...props }, ref) => {
    // Se não passarem um ID, usamos o name como fallback para acessibilidade
    const inputId = id || name;

    return (
      <div className={`${styles.container} ${className || ""}`}>
        {/* Label linkada ao input pelo htmlFor */}
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}

        {/* O input real */}
        <input
          id={inputId}
          name={name}
          ref={ref} // <--- AQUI! A ref do React Hook Form é injetada aqui
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          {...props} // Repassa todo o resto (placeholder, type, onChange, etc)
        />

        {/* Mensagem de erro */}
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

// Necessário para debugging no React DevTools
Input.displayName = "Input";
