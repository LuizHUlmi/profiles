// src/components/ui/card/BaseCard.tsx
import React from "react";
import styles from "./BaseCard.module.css";

interface BaseCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode; // Permite passar strings ou elementos (como o seu Titular | Tipo)
  actions?: React.ReactNode; // Onde entrarão os botões de editar/excluir
  footerLabel: string;
  footerValue: string;
  footerSecondaryValue?: string;
  variant?: "default" | "danger";
}

export function BaseCard({
  icon,
  title,
  subtitle,
  actions,
  footerLabel,
  footerValue,
  footerSecondaryValue,
  variant = "default",
}: BaseCardProps) {
  return (
    <div className={styles.card}>
      {/* LINHA SUPERIOR */}
      <div className={styles.topRow}>
        <div className={styles.infoGroup}>
          <div
            className={`${styles.iconContainer} ${variant === "danger" ? styles.iconDanger : ""}`}
          >
            {icon}
          </div>

          <div className={styles.textInfo}>
            <h3 className={styles.title} title={title}>
              {title}
            </h3>
            <div className={styles.subtitle}>{subtitle}</div>
          </div>
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {/* LINHA INFERIOR */}
      <div className={styles.bottomRow}>
        <span className={styles.valueLabel}>{footerLabel}</span>
        <span
          className={`${styles.value} ${variant === "danger" ? styles.valueDanger : ""}`}
        >
          {footerValue}
        </span>
        {footerSecondaryValue && (
          <span className={styles.secondaryValue}>{footerSecondaryValue}</span>
        )}
      </div>
    </div>
  );
}
