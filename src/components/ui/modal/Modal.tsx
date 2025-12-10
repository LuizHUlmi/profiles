// src/components/ui/Modal.tsx

import React from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    // MUDANÇA AQUI: Removemos o "onClick={onClose}" desta div
    <div className={styles.modalOverlay}>
      {/* Também podemos remover o "e.stopPropagation()" daqui, pois o pai não tem mais evento de clique */}
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}
