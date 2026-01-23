// src/components/ui/pageHeader/PageHeader.tsx
import React from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode; // Aqui entra o botão, se houver
}

export function PageHeader({
  title,
  subtitle,
  icon,
  children,
}: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>
          {icon && <span className={styles.icon}>{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
