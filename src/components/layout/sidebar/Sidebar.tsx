// src/components/layout/Sidebar.tsx

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import styles from "./Sidebar.module.css";

import {
  LayoutDashboard,
  Target,
  Users,
  ArrowLeft,
  ArrowRight,
  LogOut,
  UserPen,
} from "lucide-react";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, profile } = useAuth();

  // VERIFICAÇÃO DE SEGURANÇA VISUAL
  // Só mostra o menu se for da equipe (staff) E tiver nível 'master'
  const isMaster = profile?.userType === "staff" && profile?.role === "master";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
    return isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink;
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.toggleButton}
        >
          {collapsed ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/" end className={getNavLinkClass}>
          <LayoutDashboard size={20} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/planejamento" className={getNavLinkClass}>
          <Target size={20} />
          {!collapsed && <span>Planejamento</span>}
        </NavLink>

        <NavLink to="/cliente" className={getNavLinkClass}>
          <UserPen size={20} />
          {!collapsed && <span>Clientes</span>}
        </NavLink>

        {/* RENDERIZAÇÃO CONDICIONAL: Só aparece para Master */}
        {isMaster && (
          <NavLink to="/equipe" className={getNavLinkClass}>
            <Users size={20} />
            {!collapsed && <span>Equipe</span>}
          </NavLink>
        )}
      </nav>

      <div className={styles.footer}>
        <button
          onClick={signOut}
          className={styles.navLink}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#ff8787",
            marginTop: "auto",
          }}
        >
          <LogOut size={20} />
          {!collapsed && <span style={{ marginLeft: "1rem" }}>Sair</span>}
        </button>
        {!collapsed && (
          <div
            style={{
              textAlign: "center",
              marginTop: "1rem",
              opacity: 0.5,
              fontSize: "0.75rem",
            }}
          >
            v1.0.0
          </div>
        )}
      </div>
    </aside>
  );
}
