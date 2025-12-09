// src/components/financial/FinancialChart.tsx

import ReactECharts from "echarts-for-react";

type FinancialChartProps = {
  ages: number[];
  years: string[];
  dataProjected: number[];
};

export function FinancialChart({
  ages,
  years,
  dataProjected,
}: FinancialChartProps) {
  // Cores alinhadas com o index.css (Design System)
  const colors = {
    primary: "#007bff", // var(--primary)
    primaryLight: "rgba(0, 123, 255, 0.2)",
    text: "#333333", // var(--text-primary)
    textLight: "#666666", // var(--text-secondary)
    grid: "#e0e0e0", // var(--border-color)
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
        // Cabeçalho do Tooltip
        let result = `<div style="margin-bottom: 8px; font-weight: 600; color: ${colors.textLight}">
                        ${params[0].axisValue} <span style="font-weight:normal">(${ages[index]} anos)</span>
                      </div>`;

        // Itens do Tooltip
        params.forEach((item) => {
          result += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 15px; font-size: 14px;">
            <div style="display:flex; align-items:center; gap: 6px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${
                  item.color
                };"></span>
                <span>${item.seriesName}</span>
            </div>
            <span style="font-weight: 700;">${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.value)}</span>
          </div>`;
        });
        return result;
      },
      padding: [12, 16],
      extraCssText:
        "box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px;",
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
        interval: 59, // Mostra a cada 5 anos (12 meses * 5 - 1)
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
      {
        name: "Patrimônio Total",
        type: "line",
        smooth: 0.3,
        showSymbol: false,
        lineStyle: {
          color: colors.primary,
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
              { offset: 0, color: colors.primaryLight },
              { offset: 1, color: "rgba(0, 123, 255, 0)" },
            ],
          },
        },
        data: dataProjected,
      },
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
