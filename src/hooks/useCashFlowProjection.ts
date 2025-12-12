// src/hooks/useCashFlowProjection.ts

import { useMemo } from "react";
import { calculateAge } from "../utils/date";
import type { ItemFluxoCaixa } from "../types/database";

type ProjectionParams = {
  items: ItemFluxoCaixa[];
  birthDate?: string;
  lifeExpectancy?: number;
};

export function useCashFlowProjection({
  items,
  birthDate,
  lifeExpectancy = 90,
}: ProjectionParams) {
  return useMemo(() => {
    if (!birthDate)
      return { categories: [], incomes: [], expenses: [], balances: [] };

    const currentAge = calculateAge(birthDate);
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthDate).getFullYear();
    const endAge = lifeExpectancy;
    const yearsToSimulate = endAge - currentAge;

    const categories: string[] = [];
    const incomes: number[] = [];
    const expenses: number[] = [];
    const balances: number[] = []; // <--- NOVA SÉRIE

    const DEFAULT_INFLATION = 0.045; // 4.5% a.a.

    for (let i = 0; i <= yearsToSimulate; i++) {
      const simYear = currentYear + i;
      const simAge = currentAge + i;

      categories.push(`${simYear}\n(${simAge} anos)`);

      let totalIncomeYear = 0;
      let totalExpenseYear = 0;

      items.forEach((item) => {
        let itemStartYear = 0;
        if (item.inicio_tipo === "ano") {
          itemStartYear = item.inicio_valor;
        } else {
          itemStartYear = birthYear + item.inicio_valor;
        }

        const itemEndYear = itemStartYear + item.duracao_anos;

        if (simYear >= itemStartYear && simYear < itemEndYear) {
          const yearsActive = simYear - itemStartYear;
          const rate = item.correcao_anual
            ? item.correcao_anual / 100
            : DEFAULT_INFLATION;

          const correctedValue =
            item.valor_mensal * Math.pow(1 + rate, yearsActive);

          if (item.tipo === "receita") {
            totalIncomeYear += correctedValue;
          } else {
            totalExpenseYear += correctedValue;
          }
        }
      });

      // Arredonda valores
      const inc = Math.round(totalIncomeYear);
      const exp = Math.round(totalExpenseYear);

      incomes.push(inc);
      expenses.push(exp);
      balances.push(inc - exp); // <--- CALCULA O SALDO
    }

    return { categories, incomes, expenses, balances };
  }, [items, birthDate, lifeExpectancy]);
}
