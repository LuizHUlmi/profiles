// src/components/financial/grafico/CashFlowChart.tsx

import ReactECharts from "echarts-for-react";

type CashFlowChartProps = {
  categories: string[];
  incomes: number[];
  expenses: number[];
  balances: number[]; // <--- NOVA PROP
};

export function CashFlowChart({
  categories,
  incomes,
  expenses,
  balances,
}: CashFlowChartProps) {
  const colors = {
    income: "#16a34a", // Verde
    expense: "#dc2626", // Vermelho
    balance: "#007bff", // Azul (Primary) para o Saldo
    grid: "#e0e0e0",
    text: "#666",
  };

  const options = {
    title: {
      text: "Fluxo de Caixa Projetado (Mensal)",
      left: "0",
      textStyle: { fontSize: 16, fontWeight: "600", fontFamily: "Inter" },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (params: any[]) {
        let result = `<div style="margin-bottom:8px; font-weight:600">${params[0].axisValue}</div>`;

        params.forEach((item) => {
          // Ajusta cor no tooltip
          let color = item.color;
          if (item.seriesName === "Receitas") color = colors.income;
          if (item.seriesName === "Despesas") color = colors.expense;
          if (item.seriesName === "Saldo Líquido") color = colors.balance;

          result += `
            <div style="display:flex; justify-content:space-between; gap:15px; font-size:13px">
              <span style="color:${color}">● ${item.seriesName}</span>
              <strong>${new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(item.value)}</strong>
            </div>
          `;
        });
        return result;
      },
    },
    legend: {
      data: ["Receitas", "Despesas", "Saldo Líquido"],
      bottom: 0,
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "10%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: categories,
      axisLabel: {
        interval: "auto",
        color: colors.text,
        fontSize: 11,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
          return value;
        },
        color: colors.text,
      },
      splitLine: {
        lineStyle: { type: "dashed", color: colors.grid },
      },
    },
    series: [
      {
        name: "Receitas",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: colors.income, opacity: 0.6 }, // Deixei um pouco mais leve para destacar o saldo
        data: incomes,
      },
      {
        name: "Despesas",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: colors.expense, opacity: 0.6 },
        data: expenses,
      },
      {
        name: "Saldo Líquido",
        type: "line",
        smooth: true,
        showSymbol: false, // Pode mudar para true se quiser ver os pontos
        lineStyle: { width: 4, color: colors.balance }, // Linha mais grossa para destaque
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(0, 123, 255, 0.2)" },
              { offset: 1, color: "rgba(0, 123, 255, 0)" },
            ],
          },
        },
        data: balances,
      },
    ],
  };

  return (
    <ReactECharts option={options} style={{ height: "350px", width: "100%" }} />
  );
}
