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
}: ProjectionParams) {
  const projectionData = useMemo(() => {
    // 1. Definições de Tempo
    const hoje = new Date();
    // Normaliza para dia 1 para evitar problemas de meses curtos
    const dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const idadeFinal = expectativaVida;
    const anosParaSimular = idadeFinal - idadeAtual;
    const totalMeses = anosParaSimular * 12;

    // 2. Taxas
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
      saldoBase = saldoBase * (1 + taxaJurosMensal);
      saldoReal = saldoReal * (1 + taxaJurosMensal);

      // B. Aporte / Retirada (Fluxo de Vida)
      if (idadeNoPonto < idadeAposentadoria) {
        saldoBase += investimentoMensal;
        saldoReal += investimentoMensal;
      } else {
        const retirada = Math.max(0, rendaDesejada - outrasRendas);
        saldoBase -= retirada;
        saldoReal -= retirada;
      }

      // C. Projetos (Custo de Oportunidade)
      projetosAtivos.forEach((projeto) => {
        // Se não tiver idade definida, assume que é AGORA (idadeAtual)
        const idadeAlvo = projeto.idade_realizacao ?? idadeAtual;

        const ehAnoDoProjeto = idadeNoPonto === idadeAlvo;
        const ehJaneiro = mes === 0;

        // Desconta se for o início da simulação (agora) OU se for janeiro do ano alvo futuro
        const deveDescontarAgora =
          (i === 0 && ehAnoDoProjeto) || (i > 0 && ehAnoDoProjeto && ehJaneiro);

        if (deveDescontarAgora) {
          saldoReal -= projeto.valor;
        }
      });

      // Travas visuais de zero (opcional, para gráfico não ficar negativo) // Desenvolver um botã para optar por usar ou não essa função
      if (saldoBase < 0) saldoBase = 0;
      if (saldoReal < 0) saldoReal = 0;

      labelsAge.push(idadeNoPonto);
      labelsYear.push(`${monthNames[mes]}/${ano}`);
      saldoProjetado.push(Math.round(saldoBase));
      saldoComProjetosProjetado.push(Math.round(saldoReal));
    }

    return {
      ages: labelsAge,
      years: labelsYear,
      dataProjected: saldoProjetado, // Linha Azul (Referência)
      dataWithProjects: saldoComProjetosProjetado, // Linha Laranja (Com os descontos dos projetos)
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
  ]);

  return projectionData;
}
