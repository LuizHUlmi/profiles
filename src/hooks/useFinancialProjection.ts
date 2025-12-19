// src/hooks/useFinancialProjection.ts

import { useMemo } from "react";
import type { Projeto } from "../types/database";

type ProjectionParams = {
  idadeAtual?: number;
  patrimonioAtual: number;
  idadeAposentadoria: number;
  rendaDesejada: number;
  outrasRendas: number;
  investimentoMensal: number;
  expectativaVida?: number;
  projects?: Projeto[];
  activeProjectIds?: number[];
  allowNegative?: boolean; // <--- NOVO: Controle para permitir saldo negativo
};

export function useFinancialProjection({
  idadeAtual = 30,
  patrimonioAtual,
  idadeAposentadoria,
  rendaDesejada,
  outrasRendas,
  investimentoMensal,
  expectativaVida = 100,
  projects = [],
  activeProjectIds = [],
  allowNegative = false, // Padrão: não permite negativo (trava em 0)
}: ProjectionParams) {
  const projectionData = useMemo(() => {
    // 1. Definições de Tempo
    const hoje = new Date();
    // Normaliza para dia 1 para evitar problemas de meses curtos
    const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const idadeFinal = expectativaVida;
    const anosParaSimular = idadeFinal - idadeAtual;

    // Evita loop infinito ou negativo se a idade atual for maior que a expectativa
    const totalMeses = Math.max(0, anosParaSimular * 12);

    // 2. Taxas (Ex: 4.5% a.a. acima da inflação)
    const taxaJurosAnual = 0.045;
    const taxaJurosMensal = Math.pow(1 + taxaJurosAnual, 1 / 12) - 1;

    // 3. Arrays de Dados
    const labelsAge: number[] = [];
    const labelsYear: string[] = [];
    const saldoProjetado: number[] = [];
    const saldoComProjetosProjetado: number[] = [];

    let saldoBase = patrimonioAtual;
    let saldoReal = patrimonioAtual;

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Filtra apenas projetos ativos
    const projetosAtivos = projects.filter((p) =>
      activeProjectIds.includes(p.id)
    );

    // --- LOOP MENSAL ---
    for (let i = 0; i <= totalMeses; i++) {
      const dataPonto = new Date(
        dataInicial.getFullYear(),
        dataInicial.getMonth() + i,
        1
      );
      const mes = dataPonto.getMonth(); // 0-11
      const ano = dataPonto.getFullYear();

      const idadeNoPonto = idadeAtual + Math.floor(i / 12);

      // A. Rendimento (Juros Compostos)
      // Aplica juros apenas se o saldo for positivo (dívida geralmente tem juros diferentes,
      // aqui assumimos que saldo negativo não rende a favor)
      if (saldoBase > 0) saldoBase = saldoBase * (1 + taxaJurosMensal);
      if (saldoReal > 0) saldoReal = saldoReal * (1 + taxaJurosMensal);

      // B. Aporte / Retirada (Fluxo de Vida)
      if (idadeNoPonto < idadeAposentadoria) {
        // Fase de Acumulação
        saldoBase += investimentoMensal;
        saldoReal += investimentoMensal;
      } else {
        // Fase de Usufruto (Aposentadoria)
        const retiradaNecessaria = Math.max(0, rendaDesejada - outrasRendas);
        saldoBase -= retiradaNecessaria;
        saldoReal -= retiradaNecessaria;
      }

      // C. Projetos (Custo de Oportunidade)
      projetosAtivos.forEach((projeto) => {
        // Verifica se chegamos no ano do projeto
        const ehAnoDoProjeto = ano === projeto.ano_realizacao;

        // Desconta apenas em Janeiro do ano de realização para não descontar 12x
        // OU se a simulação começar no meio do ano do projeto (i===0)
        const deveDescontar =
          (ehAnoDoProjeto && mes === 0) || (i === 0 && ehAnoDoProjeto);

        if (deveDescontar) {
          // Usa 'valor_total' conforme padronizado no banco
          saldoReal -= projeto.valor_total;
        }
      });

      // D. Trava de Zero (Opcional)
      if (!allowNegative) {
        if (saldoBase < 0) saldoBase = 0;
        if (saldoReal < 0) saldoReal = 0;
      }

      // Otimização de Gráfico:
      // Para não pesar o ECharts com 800 pontos, podemos salvar apenas
      // pontos anuais (Janeiro) OU manter mensal se performance não for problema.
      // Vou manter mensal por enquanto para suavidade, mas se quiser otimizar, coloque: if (mes === 0) {...}

      labelsAge.push(idadeNoPonto);
      labelsYear.push(`${monthNames[mes]}/${ano}`); // Ex: Jan/2025
      saldoProjetado.push(Math.round(saldoBase));
      saldoComProjetosProjetado.push(Math.round(saldoReal));
    }

    return {
      ages: labelsAge,
      years: labelsYear,
      dataProjected: saldoProjetado, // Linha Azul (Referência)
      dataWithProjects: saldoComProjetosProjetado, // Linha Verde (Real)
    };
  }, [
    idadeAtual,
    patrimonioAtual,
    idadeAposentadoria,
    rendaDesejada,
    outrasRendas,
    investimentoMensal,
    expectativaVida,
    projects,
    activeProjectIds,
    allowNegative, // Adicionado na dependência
  ]);

  return projectionData;
}
