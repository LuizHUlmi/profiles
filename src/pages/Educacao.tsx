// src/pages/Educacao.tsx

import { useEffect, useState } from "react";
import { useActiveClient } from "../context/ActiveClientContext";
import { useEducacao } from "../hooks/useEducacao";
import { useFamily } from "../hooks/useFamily";
import { Button } from "../components/ui/button/Button";
import { Modal } from "../components/ui/modal/Modal";
import { EducacaoForm } from "../components/education/EducacaoForm";
import { EducacaoCard } from "../components/education/EducacaoCard"; // <--- Novo Componente
import { ClientSelectionPlaceholder } from "../components/ui/placeholders/ClientSelectionPlaceholder";
import { GraduationCap, Plus } from "lucide-react";
import styles from "./Educacao.module.css";
import type { ItemEducacao } from "../types/database";

export function Educacao() {
  const { activeClientId } = useActiveClient();

  // Hooks
  const { itens, fetchEducacao, addEducacao, updateEducacao, deleteEducacao } =
    useEducacao(activeClientId || "");
  const { familiares, fetchFamily } = useFamily(activeClientId || "");

  // Estado local
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemEducacao | null>(null);

  useEffect(() => {
    if (activeClientId) {
      fetchEducacao();
      fetchFamily();
    }
  }, [activeClientId, fetchEducacao, fetchFamily]);

  // Handlers
  const handleCreate = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: ItemEducacao) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (data: any) => {
    if (itemToEdit) {
      return await updateEducacao(itemToEdit.id, data);
    } else {
      return await addEducacao(data);
    }
  };

  // Renderização condicional (Placeholder)
  if (!activeClientId) {
    return (
      <ClientSelectionPlaceholder
        title="Planejamento Educacional"
        message="Selecione um cliente para gerenciar os custos de educação da família."
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <GraduationCap size={32} color="#0ea5e9" />
            Educação
          </h2>
          <p className={styles.subtitle}>
            Planejamento escolar e universitário da família.
          </p>
        </div>
        <Button onClick={handleCreate} icon={<Plus size={18} />}>
          Novo Planejamento
        </Button>
      </div>

      {/* Grid de Cards */}
      <div className={styles.grid}>
        {itens.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Nenhum planejamento educacional cadastrado.
            </p>
          </div>
        ) : (
          itens.map((item) => {
            const nomeBeneficiario =
              item.beneficiario_tipo === "titular"
                ? "Titular"
                : familiares.find((f) => f.id === item.familiar_id)?.nome ||
                  "Dependente";

            return (
              <EducacaoCard
                key={item.id}
                item={item}
                nomeBeneficiario={nomeBeneficiario}
                onDelete={deleteEducacao}
                onEdit={handleEdit}
              />
            );
          })
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {isModalOpen && (
          <EducacaoForm
            familiares={familiares}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleFormSubmit}
            // Observação: Precisaremos atualizar o EducacaoForm para aceitar 'initialData'
            // igual fizemos no SeguroForm. Posso mandar o código do form na sequência.
            // initialData={itemToEdit}
          />
        )}
      </Modal>
    </div>
  );
}
