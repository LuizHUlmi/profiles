// src/components/financial/grafico/FinancialChart.tsx

import ReactECharts from "echarts-for-react";

type FinancialChartProps = {
  ages: number[];
  years: (string | number)[];
  dataProjected: number[]; // Cenário Base (Sem projetos)
  dataWithProjects?: number[]; // Cenário Real (Com projetos) <--- NOVO
};

export function FinancialChart({
  ages,
  years,
  dataProjected,
  dataWithProjects,
}: FinancialChartProps) {
  const colors = {
    primary: "#007bff", // Azul (Base)
    secondary: "#f97316", // Laranja (Real/Com Projetos)
    text: "#333333",
    textLight: "#666666",
    grid: "#e0e0e0",
  };

  const options = {
    title: {
      text: "Projeção de Patrimônio",
      left: "0",
      textStyle: {
        color: colors.text,
        fontSize: 16,
        fontWeight: "600",
        fontFamily: "Inter, sans-serif",
      },
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: colors.grid,
      borderWidth: 1,
      textStyle: { color: colors.text },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (params: any[]) {
        const index = params[0].dataIndex;
        let result = `<div style="margin-bottom: 8px; font-weight: 600; color: ${colors.textLight}">
                        ${params[0].axisValue} <span style="font-weight:normal">(${ages[index]} anos)</span>
                      </div>`;

        params.forEach((item) => {
          // Formata valor monetário
          const val = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(item.value);

          result += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 15px; font-size: 14px;">
            <div style="display:flex; align-items:center; gap: 6px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${item.color};"></span>
                <span>${item.seriesName}</span>
            </div>
            <span style="font-weight: 700;">${val}</span>
          </div>`;
        });
        return result;
      },
    },
    grid: {
      left: "0",
      right: "2%",
      bottom: "3%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: years,
      axisLabel: {
        interval: 59,
        formatter: (value: string, index: number) => {
          const ano = value.split("/")[1];
          return `${ano}\n${ages[index]} anos`;
        },
        color: colors.textLight,
        fontSize: 11,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: function (value: number) {
          if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
          return value;
        },
        color: colors.textLight,
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: colors.grid,
        },
      },
    },
    series: [
      // SÉRIE 1: BASE (Azul) - Tracejada se tiver projetos, Sólida se não tiver
      {
        name: "Cenário Base (Sem Projetos)",
        type: "line",
        smooth: 0.3,
        showSymbol: false,
        lineStyle: {
          color: colors.primary,
          width: 2,
          type: dataWithProjects ? "dashed" : "solid", // Fica tracejada para comparar
          opacity: 0.6,
        },
        data: dataProjected,
      },
      // SÉRIE 2: REAL (Laranja) - Só aparece se houver dados
      ...(dataWithProjects
        ? [
            {
              name: "Cenário Real (Com Projetos)",
              type: "line",
              smooth: 0.3,
              showSymbol: false,
              lineStyle: {
                color: colors.secondary,
                width: 3,
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: "rgba(249, 115, 22, 0.2)" }, // Laranja claro
                    { offset: 1, color: "rgba(249, 115, 22, 0)" },
                  ],
                },
              },
              data: dataWithProjects,
            },
          ]
        : []),
    ],
  };

  return (
    <ReactECharts
      option={options}
      style={{ height: "400px", width: "100%" }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
}
