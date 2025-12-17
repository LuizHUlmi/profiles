// src/components/ui/input/Input.tsx

import { forwardRef, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";
// Importamos o SEU componente existente
import { InfoTooltip } from "../tooltip/InfoTooltip";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  tooltip?: string; // Prop opcional para o texto da ajuda
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, tooltip, id, name, ...props }, ref) => {
    const inputId = id || name;

    return (
      <div className={`${styles.container} ${className || ""}`}>
        {label && (
          <div className={styles.labelContainer}>
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>

            {/* Se houver texto de tooltip, renderiza seu componente */}
            {tooltip && <InfoTooltip text={tooltip} />}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
          {...props}
        />

        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
