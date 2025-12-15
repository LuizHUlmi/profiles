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
  const totalAtivos =
    totals.investimento + totals.previdencia + totals.imobilizado;
  const patrimonioLiquido = totalAtivos - totals.passivo;

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
      // Como o PL agora tem sua própria barra, podemos remover o subtext ou mantê-lo como resumo
      subtext: "Visão consolidada dos ativos e passivos",
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
        // Se trigger for axis, params é array. Se item, é objeto.
        // Aqui assumimos que vem como array ou objeto com as propriedades necessárias.
        const item = Array.isArray(params) ? params[0] : params;
        const val = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(item.value);

        // Ajuste para o nome correto no tooltip se necessário
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
      // Adicionamos "Patrimônio Líquido" na lista de categorias
      // A ordem no ECharts (category) é de baixo para cima (índice 0 fica embaixo)
      data: [
        "Patrimônio Líquido",
        "Passivos",
        "Imobilizado",
        "Previdência",
        "Investimentos", // linha do topo
      ],
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        fontWeight: "500",
        color: "#333",
        fontSize: 12, // Leve ajuste para caber
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
          // Tipagem para params do label formatter
          formatter: (params: { value: number }) =>
            currencyFormatter(params.value),
          fontWeight: "bold",
          color: "#555",
        },
        // Os dados devem seguir EXATAMENTE a ordem do yAxis.data acima
        data: [
          {
            value: patrimonioLiquido,
            itemStyle: { color: "#4338ca" }, // Roxo/Indigo (Destaque para o PL)
            name: "Patrimônio Líquido",
          },
          {
            value: totals.passivo,
            itemStyle: { color: "#dc2626" }, // Vermelho
            name: "Passivos",
          },
          {
            value: totals.imobilizado,
            itemStyle: { color: "#ca8a04" }, // Amarelo
            name: "Imobilizado",
          },
          {
            value: totals.previdencia,
            itemStyle: { color: "#0ea5e9" }, // Azul Claro
            name: "Previdência",
          },
          {
            value: totals.investimento,
            itemStyle: { color: "#16a34a" }, // Verde
            name: "Investimentos",
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
        style={{ height: "350px", width: "100%" }}
      />
    </div>
  );
}
