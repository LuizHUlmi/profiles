// src/components/ui/Button.tsx

import React from "react";
import styles from "./Button.module.css";
import { Spinner } from "../spinner/Spinner";

// Define os tipos aceitos
type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "success"
  | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean; // Se true, ocupa 100% da largura
  icon?: React.ReactNode; // Ícone opcional à esquerda
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    block ? styles.block : "",
    className,
  ].join(" ");

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        /* Agora renderiza APENAS o spinner, garantindo centralização total */
        <Spinner size="small" />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
