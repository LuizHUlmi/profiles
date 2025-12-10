// src/components/layout/MainLayout.tsx

import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";
import { Navbar } from "../navbar/Navbar"; // <--- Import Atualizado
import styles from "./MainLayout.module.css";

export function MainLayout() {
  return (
    <div className={styles.layout}>
      {/* Sidebar Fixa à Esquerda */}
      <Sidebar />

      {/* Área Principal (Conteúdo + Navbar) */}
      <div className={styles.contentWrapper}>
        {/* Navbar Fixa no Topo */}
        <Navbar />

        {/* Conteúdo da Página que rola */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
