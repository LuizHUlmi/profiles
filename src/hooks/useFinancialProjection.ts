import { useMemo } from "react";
import type { Projeto } from "../types/database";

type ProjectionParams = {
  idadeAtual?: number;
  patrimonioAtual: number;
  idadeAposentadoria: number;
  rendaDesejada: number;
  outrasRendas: number;
  investimentoMensal: number;
  projects?: Projeto[];
  activeProjectIds?: number[];
};

export function useFinancialProjection({
  idadeAtual = 38, // Valor padrão ou vindo de props
  patrimonioAtual,
  idadeAposentadoria,
  rendaDesejada,
  outrasRendas,
  investimentoMensal,
  projects = [],
  activeProjectIds = [],
}: ProjectionParams) {
  const projectionData = useMemo(() => {
    const idadeFinal = 100;
    const anosParaSimular = idadeFinal - idadeAtual;
    const taxaJurosAnual = 0.06; // 6% ao ano
    const taxaJurosMensal = Math.pow(1 + taxaJurosAnual, 1 / 12) - 1;

    // TODO: No futuro, podemos descontar o valor dos projetos no fluxo de caixa
    // const activeProjects = projects.filter((p) => activeProjectIds.includes(p.id));

    const labelsAge: number[] = [];
    const labelsYear: string[] = [];
    const saldoProjetado: number[] = [];
    let saldo = patrimonioAtual;

    for (let ano = 0; ano <= anosParaSimular; ano++) {
      const idadeNoAno = idadeAtual + ano;
      const anoCalendario = new Date().getFullYear() + ano;

      for (let mes = 0; mes < 12; mes++) {
        // 1. Aplica rendimento
        saldo = saldo * (1 + taxaJurosMensal);

        // 2. Aplica fluxo de caixa (Aporte ou Retirada)
        if (idadeNoAno < idadeAposentadoria) {
          saldo += investimentoMensal;
        } else {
          // Na aposentadoria, subtraímos a necessidade de renda (descontando o que já tem de outras fontes)
          const necessidadeDeRetirada = Math.max(
            0,
            rendaDesejada - outrasRendas
          );
          saldo -= necessidadeDeRetirada;
        }

        // Evita saldo negativo visualmente feio no gráfico (opcional)
        if (saldo < 0) saldo = 0;

        labelsAge.push(idadeNoAno);
        labelsYear.push(`Jan/${anoCalendario}`); // Simplificação
        saldoProjetado.push(Math.round(saldo));
      }
    }

    return {
      ages: labelsAge,
      years: labelsYear,
      dataProjected: saldoProjetado,
    };
  }, [
    idadeAtual,
    patrimonioAtual,
    idadeAposentadoria,
    rendaDesejada,
    outrasRendas,
    investimentoMensal,
    projects,
    activeProjectIds,
  ]);

  return projectionData;
}
