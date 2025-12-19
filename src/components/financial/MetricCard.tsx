// src/components/financial/MetricCard.tsx
// src/components/financial/MetricCard.tsx
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  colorTheme: "blue" | "green" | "purple" | "orange";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorTheme,
}: MetricCardProps) {
  // Mapas de cores baseados no tema
  const colors = {
    blue: { bg: "#dbeafe", text: "#1e40af", iconBg: "#eff6ff" },
    green: { bg: "#dcfce7", text: "#166534", iconBg: "#f0fdf4" },
    purple: { bg: "#f3e8ff", text: "#6b21a8", iconBg: "#faf5ff" },
    orange: { bg: "#ffedd5", text: "#9a3412", iconBg: "#fff7ed" },
  };

  const theme = colors[colorTheme];

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: theme.iconBg,
            color: theme.text,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div>
        <span
          style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}
        >
          {title}
        </span>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#1e293b",
            marginTop: "4px",
          }}
        >
          {value}
        </div>
        {subtitle && (
          <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
