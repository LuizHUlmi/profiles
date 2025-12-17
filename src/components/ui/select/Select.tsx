// src/components/ui/select/Select.tsx

import { forwardRef, type SelectHTMLAttributes } from "react";
import styles from "./Select.module.css";

interface SelectOption {
  label: string;
  value: string | number;
}

// CORREÇÃO: Adicionamos 'placeholder' explicitamente na interface
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string; // <--- Agora o TypeScript aceita
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      className,
      options,
      children,
      id,
      name,
      placeholder,
      ...props
    },
    ref
  ) => {
    const selectId = id || name;

    return (
      <div className={`${styles.container} ${className || ""}`}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}

        <select
          id={selectId}
          name={name}
          ref={ref}
          className={`${styles.select} ${error ? styles.selectError : ""}`}
          {...props}
        >
          {/* Lógica do Placeholder: Uma opção vazia, desabilitada e oculta */}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {/* Renderiza opções passadas via array prop */}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}

          {/* Renderiza opções passadas via children */}
          {children}
        </select>

        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
