import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import styles from "./Sidebar.module.css";

// --- IMPORTAÇÃO DOS LOGOS ---
import logoFull from "../../../assets/logo/logo-full.png";
import logoIcon from "../../../assets/logo/logo-icon.png";
// ----------------------------

import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCog,
  Scale,
  ArrowLeftRight,
  ShieldCheck,
  GraduationCap,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const { signOut, profile } = useAuth();
  const { userId } = useParams();

  // Estado para controlar o submenu "Gestão"
  const [isGestaoOpen, setIsGestaoOpen] = useState(false);

  const toggleGestao = () => {
    if (isCollapsed) {
      toggleSidebar();
      setIsGestaoOpen(true);
    } else {
      setIsGestaoOpen(!isGestaoOpen);
    }
  };

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={toggleSidebar}
        className={styles.toggleButton}
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* HEADER: Apenas para o Logo */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          {isCollapsed ? (
            <img src={logoIcon} alt="Logo Ícone" className={styles.logoIcon} />
          ) : (
            <img src={logoFull} alt="Logo Avere" className={styles.logoFull} />
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        {/* === BLOCO: DADOS DO CLIENTE === */}
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
                <UserCog />
              </div>
              {!isCollapsed && <span>Dados do Cliente</span>}
            </NavLink>
          )}

        {/* === BLOCO: MINHA CONTA === */}
        <NavLink
          to="/perfil"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Minha Conta"
          end
        >
          <div className={styles.iconContainer}>
            <UserCircle />
          </div>
          {!isCollapsed && <span>Minha Conta</span>}
        </NavLink>

        {!isCollapsed && <div className={styles.divider}></div>}

        {/* === BLOCO: FERRAMENTAS PRINCIPAIS === */}
        <NavLink
          to="/ativos-passivos"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Ativos e Passivos"
        >
          <div className={styles.iconContainer}>
            <Scale />
          </div>
          {!isCollapsed && <span>Ativos e Passivos</span>}
        </NavLink>

        <NavLink
          to="/protecao"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Proteção e Seguros"
        >
          <div className={styles.iconContainer}>
            <ShieldCheck />
          </div>
          {!isCollapsed && <span>Proteção</span>}
        </NavLink>

        <NavLink
          to="/educacao"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Educação"
        >
          <div className={styles.iconContainer}>
            <GraduationCap />
          </div>
          {!isCollapsed && <span>Educação</span>}
        </NavLink>

        <NavLink
          to="/entradas-saidas"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Entradas e Saídas"
        >
          <div className={styles.iconContainer}>
            <ArrowLeftRight />
          </div>
          {!isCollapsed && <span>Entradas e Saídas</span>}
        </NavLink>

        <NavLink
          to={userId ? `/futuro/${userId}` : "/"}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
          title="Futuro"
          end
        >
          <div className={styles.iconContainer}>
            <LayoutDashboard />
          </div>
          {!isCollapsed && <span>Futuro</span>}
        </NavLink>

        {/* === BLOCO: GESTÃO (Exclusivo MASTER) === */}
        {profile?.role === "master" && (
          <>
            {!isCollapsed && <div className={styles.divider}></div>}

            <button
              onClick={toggleGestao}
              className={styles.menuGroup}
              title="Gestão"
            >
              <div className={styles.menuGroupContent}>
                <div className={styles.iconContainer}>
                  <Settings />
                </div>
                {!isCollapsed && <span>Gestão</span>}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={16}
                  className={styles.chevron}
                  style={{
                    transform: isGestaoOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                />
              )}
            </button>

            {isGestaoOpen && !isCollapsed && (
              <div className={styles.subMenu}>
                <NavLink
                  to="/equipe"
                  className={({ isActive }) =>
                    `${styles.navItem} ${styles.subItem} ${
                      isActive ? styles.active : ""
                    }`
                  }
                >
                  <div className={styles.iconContainer}>
                    <Briefcase />
                  </div>
                  <span>Equipe</span>
                </NavLink>

                <NavLink
                  to="/cliente"
                  className={({ isActive }) =>
                    `${styles.navItem} ${styles.subItem} ${
                      isActive ? styles.active : ""
                    }`
                  }
                >
                  <div className={styles.iconContainer}>
                    <Users />
                  </div>
                  <span>Clientes</span>
                </NavLink>

                <NavLink
                  to="/parametros"
                  className={({ isActive }) =>
                    `${styles.navItem} ${styles.subItem} ${
                      isActive ? styles.active : ""
                    }`
                  }
                >
                  <div className={styles.iconContainer}>
                    <SlidersHorizontal />
                  </div>
                  <span>Parâmetros</span>
                </NavLink>
              </div>
            )}
          </>
        )}

        {/* === BLOCO: CONSULTOR === */}
        {profile?.role === "consultor" && (
          <>
            {!isCollapsed && <div className={styles.divider}></div>}
            <NavLink
              to="/cliente"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
              title="Carteira de Clientes"
            >
              <div className={styles.iconContainer}>
                <Users />
              </div>
              {!isCollapsed && <span>Clientes</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* === FOOTER === */}
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

        <button onClick={signOut} className={styles.logoutButton} title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
