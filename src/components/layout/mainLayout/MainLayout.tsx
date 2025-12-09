// src/components/layout/MainLayout.tsx

import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar"; // 1. Importe a nova Sidebar
import styles from "./MainLayout.module.css"; // 2. Vamos usar um CSS para o layout

export function MainLayout() {
  return (
    <div className={styles.layout}>
      {/* 3. Renderize a Sidebar */}
      <Sidebar />

      {/* 4. Área de conteúdo principal */}
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
