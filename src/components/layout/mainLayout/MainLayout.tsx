// src/components/layout/MainLayout.tsx

import { useState } from "react"; // <--- Importe useState
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";

import styles from "./MainLayout.module.css";
import { Navbar } from "../navbar/Navbar";

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado agora vive aqui

  return (
    <div className={styles.layout}>
      {/* Sidebar recebe o controle */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Aplicamos uma classe dinâmica no wrapper 
         para ele saber se deve ter margem grande (260px) ou pequena (80px)
      */}
      <div
        className={`${styles.contentWrapper} ${
          isCollapsed ? styles.collapsed : ""
        }`}
      >
        <Navbar />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
