// src/pages/Protecao.tsx

import { useEffect, useState } from "react";
import { useActiveClient } from "../context/ActiveClientContext";
import { useSeguros } from "../hooks/useSeguros";
import { useFamily } from "../hooks/useFamily";
import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { SeguroForm } from "../components/protection/SeguroForm";
import { SeguroCard } from "../components/protection/SeguroCard";
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";
import { Shield, ShieldCheck, Plus } from "lucide-react";
import styles from "./Protecao.module.css";
import type { ItemSeguro } from "../types/database";

export function Protecao() {
  const { activeClientId } = useActiveClient();

  // Hooks (agora com updateSeguro)
  const { seguros, fetchSeguros, addSeguro, deleteSeguro, updateSeguro } =
    useSeguros(activeClientId || "");
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemSeguro | null>(null);

  useEffect(() => {
    if (activeClientId) {
      fetchSeguros();
      fetchFamily();
    }
  }, [activeClientId, fetchSeguros, fetchFamily]);

  // HANDLERS
  const handleCreate = () => {
    setItemToEdit(null); // Garante que form abre limpo
    setIsModalOpen(true);
  };

  const handleEdit = (item: ItemSeguro) => {
    setItemToEdit(item); // Carrega dados no form
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    if (itemToEdit) {
      // MODO EDIÇÃO
      return await updateSeguro(itemToEdit.id, data);
    } else {
      // MODO CRIAÇÃO
      return await addSeguro(data);
    }
  };

  if (!activeClientId) {
    return (
      <ClientSelectionPlaceholder
        title="Selecione um cliente"
        message="Selecione um cliente na barra superior para gerenciar Apólices de Vida e outras proteções."
      />
    );
  }

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const totalCobertura = seguros.reduce((acc, s) => acc + s.cobertura, 0);

  return (
    <div className={styles.container}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <ShieldCheck size={32} color="#0ea5e9" />
            Proteção e Seguros
          </h2>
          <p className={styles.subtitle}>
            Gestão de apólices de vida, invalidez e doenças graves.
          </p>
        </div>
        <Button onClick={handleCreate} icon={<Plus size={18} />}>
          Nova Proteção
        </Button>
      </div>

      {/* Resumo Rápido */}
      <div className={styles.summaryCard}>
        <div className={styles.iconWrapper}>
          <Shield size={28} color="#0ea5e9" />
        </div>
        <div>
          <span className={styles.summaryLabel}>
            Cobertura Total Contratada
          </span>
          <span className={styles.summaryValue}>
            {formatMoney(totalCobertura)}
          </span>
        </div>
      </div>

      {/* GRID de Cards */}
      <div className={styles.grid}>
        {seguros.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={48} className={styles.emptyIcon} />
            <p className={styles.emptyText}>
              Nenhuma proteção cadastrada ainda.
            </p>
            <div className={styles.emptyButton}>
              <Button variant="ghost" onClick={handleCreate}>
                Cadastrar primeira proteção
              </Button>
            </div>
          </div>
        ) : (
          seguros.map((seguro) => {
            const nomeSegurado =
              seguro.proprietario_tipo === "titular"
                ? "Titular"
                : familiares.find((f) => f.id === seguro.familiar_id)?.nome ||
                  "Familiar";

            return (
              <SeguroCard
                key={seguro.id}
                seguro={seguro}
                nomeSegurado={nomeSegurado}
                onDelete={deleteSeguro}
                onEdit={handleEdit} // <--- Passando a função
              />
            );
          })
        )}
      </div>

      {/* MODAL (Reutilizável para Criar e Editar) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isModalOpen && (
          <SeguroForm
            familiares={familiares}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleFormSubmit}
            profileId={activeClientId || ""}
            initialData={itemToEdit} // <--- Passando dados se houver
          />
        )}
      </Modal>
    </div>
  );
}
