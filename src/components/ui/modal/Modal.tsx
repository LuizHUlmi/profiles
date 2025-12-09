// src/components/ui/Modal.tsx

import React from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react"; // Usamos o ícone de 'X'

// Props que o Modal aceita
type ModalProps = {
  isOpen: boolean; // Controla se está visível
  onClose: () => void; // Função para fechar
  children: React.ReactNode; // O conteúdo de dentro
};

export function Modal({ isOpen, onClose, children }: ModalProps) {
  // Se não estiver aberto, não renderiza nada
  if (!isOpen) {
    return null;
  }

  return (
    // O 'portal' (overlay) que cobre a tela
    // Clicar nele chama a função onClose
    <div className={styles.modalOverlay} onClick={onClose}>
      {/* O conteúdo do modal */}
      {/* Usamos e.stopPropagation() para evitar que o clique no 
          conteúdo feche o modal (já que ele está dentro do overlay) */}
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Botão de Fechar */}
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        {/* O conteúdo que for passado (ex: o formulário do projeto) */}
        {children}
      </div>
    </div>
  );
}
