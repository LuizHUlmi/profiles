// src/components/patrimonio/PatrimonioChart.tsx

import ReactECharts from "echarts-for-react";

type PatrimonioChartProps = {
  totals: {
    investimento: number;
    previdencia: number;
    imobilizado: number;
    passivo: number;
  };
};

export function PatrimonioChart({ totals }: PatrimonioChartProps) {
  const currencyFormatter = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const options = {
    title: {
      text: "Alocação Patrimonial",
      left: "0",
      textStyle: {
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter, sans-serif",
        color: "#333",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const item = Array.isArray(params) ? params[0] : params;
        const val = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(item.value);

        return `
          <div style="font-weight:600; margin-bottom:4px">${item.name}</div>
          <div style="display:flex; align-items:center; gap:6px">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color}"></span>
            ${val}
          </div>
        `;
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => currencyFormatter(value),
        color: "#666",
      },
      splitLine: {
        lineStyle: { type: "dashed", color: "#e0e0e0" },
      },
    },
    yAxis: {
      type: "category",
      // REMOVIDO: "Patrimônio Líquido" da lista
      // A ordem aqui define a ordem de baixo para cima no gráfico
      data: ["Passivos", "Imobilizado", "Previdência", "Investimentos"],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        fontWeight: "500",
        color: "#333",
        fontSize: 12,
      },
    },
    series: [
      {
        name: "Valor",
        type: "bar",
        barWidth: "60%",
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }) =>
            currencyFormatter(params.value),
          fontWeight: "600",
          color: "#64748b",
          fontFamily: "inherit",
        },
        data: [
          {
            value: totals.passivo,
            name: "Passivos",
            // Mesmo Rosé suave (#be123c) da coluna
            itemStyle: { color: "#be123c", borderRadius: [0, 4, 4, 0] },
          },
          {
            value: totals.imobilizado,
            name: "Imobilizado",
            // Mesmo Slate 400 (#94a3b8) da coluna
            itemStyle: { color: "#94a3b8", borderRadius: [0, 4, 4, 0] },
          },
          {
            value: totals.previdencia,
            name: "Previdência",
            // Mesmo Slate 600 (#475569) da coluna
            itemStyle: { color: "#475569", borderRadius: [0, 4, 4, 0] },
          },
          {
            value: totals.investimento,
            name: "Investimentos",
            // Mesmo Slate 800 (#1e293b) da coluna
            itemStyle: { color: "#1e293b", borderRadius: [0, 4, 4, 0] },
          },
        ],
      },
    ],
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "2rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        border: "1px solid #e0e0e0",
      }}
    >
      <ReactECharts
        option={options}
        // Reduzi levemente a altura (de 350px para 300px) pois tem uma barra a menos
        style={{ height: "300px", width: "100%" }}
      />
    </div>
  );
}
