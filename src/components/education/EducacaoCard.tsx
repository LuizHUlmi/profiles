// src/components/education/EducacaoCard.tsx

import { GraduationCap, Pencil, Trash2, CalendarRange } from "lucide-react";
import type { ItemEducacao } from "../../types/database";
import styles from "./EducacaoCard.module.css";

interface EducacaoCardProps {
  item: ItemEducacao;
  nomeBeneficiario: string;
  onEdit: (item: ItemEducacao) => void;
  onDelete: (id: number) => void;
}

export function EducacaoCard({
  item,
  nomeBeneficiario,
  onEdit,
  onDelete,
}: EducacaoCardProps) {
  const formatMoney = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const anoFim = item.ano_inicio + item.duracao_anos;

  return (
    <div className={styles.card}>
      {/* LINHA SUPERIOR: Ícone + Info + Ações */}
      <div className={styles.topRow}>
        <div className={styles.infoGroup}>
          {/* Container do Ícone Padronizado */}
          <div className={styles.iconContainer}>
            <GraduationCap size={24} strokeWidth={1.5} />
          </div>

          <div className={styles.textInfo}>
            <h3 className={styles.title} title={item.nome}>
              {item.nome}
            </h3>

            {/* Subtítulo com separador pipe '|' padrão do sistema */}
            <div
              className={styles.subtitle}
              title={`${nomeBeneficiario} | ${item.duracao_anos} anos`}
            >
              <span>{nomeBeneficiario}</span>
              <span> | </span>
              <span>{item.duracao_anos} anos</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className={styles.actions}>
          <button
            onClick={() => onEdit(item)}
            className={styles.actionBtn}
            title="Editar"
          >
            <Pencil size={16} strokeWidth={2} />
          </button>
          <button
            onClick={() => {
              if (confirm("Excluir este planejamento?")) onDelete(item.id);
            }}
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            title="Excluir"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* LINHA INFERIOR: Valor e Detalhes Secundários */}
      <div className={styles.bottomRow}>
        <span className={styles.valueLabel}>Custo Mensal Estimado</span>

        <span className={styles.value}>{formatMoney(item.custo_mensal)}</span>

        {/* Informações Secundárias (Datas e Correção) */}
        <div className={styles.secondaryValue}>
          <CalendarRange size={12} />
          <span>
            {item.ano_inicio} até {anoFim}
          </span>
          {item.correcao_anual ? (
            <>
              <span>•</span>
              <span>IPCA + {item.correcao_anual}%</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
