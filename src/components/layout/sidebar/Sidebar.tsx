// src/components/sidebar/Sidebar.tsx

import { NavLink, useParams } from "react-router-dom";

import styles from "./Sidebar.module.css";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

// Definimos o que a Sidebar espera receber do Pai
interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const { userId } = useParams();

  // Removemos o useState interno. Agora usamos as props isCollapsed e toggleSidebar

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.header}>
        {!isCollapsed && <h1 className={styles.logo}>AVERE</h1>}
        <button
          onClick={toggleSidebar}
          className={styles.toggleButton}
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to={userId ? `/dashboard/${userId}` : "/"}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Dashboard"
          end
        >
          <div className={styles.iconContainer}>
            <LayoutDashboard size={22} />
          </div>
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        {userId &&
          (profile?.role === "master" || profile?.role === "consultor") && (
            <NavLink
              to={`/perfil/${userId}`}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              title="Dados do Cliente"
            >
              <div className={styles.iconContainer}>
                <UserCog size={22} />
              </div>
              {!isCollapsed && <span>Dados do Cliente</span>}
            </NavLink>
          )}

        {!isCollapsed && <div className={styles.divider}></div>}

        {(profile?.role === "master" || profile?.role === "consultor") && (
          <NavLink
            to="/cliente"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            title="Carteira de Clientes"
          >
            <div className={styles.iconContainer}>
              <Users size={22} />
            </div>
            {!isCollapsed && <span>Clientes</span>}
          </NavLink>
        )}

        {profile?.role === "master" && (
          <NavLink
            to="/equipe"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
            title="Equipe"
          >
            <div className={styles.iconContainer}>
              <Briefcase size={22} />
            </div>
            {!isCollapsed && <span>Equipe</span>}
          </NavLink>
        )}

        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Minha Conta"
          end
        >
          <div className={styles.iconContainer}>
            <UserCircle size={22} />
          </div>
          {!isCollapsed && <span>Minha Conta</span>}
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userSection}>
          <div className={styles.userAvatar}>
            {profile?.nome?.charAt(0).toUpperCase() || "U"}
          </div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{profile?.nome}</span>
              <span className={styles.userRole}>
                {profile?.role === "master"
                  ? "Master"
                  : profile?.role === "consultor"
                  ? "Consultor"
                  : "Cliente"}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={signOut}
            className={styles.logoutButton}
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
}
