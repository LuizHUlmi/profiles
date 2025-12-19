// src/components/financial/grafico/FinancialChart.tsx

import ReactECharts from "echarts-for-react";

type EChartsParam = {
  axisValue: string;
  color: string;
  seriesName: string;
  value: number;
  dataIndex: number;
};

type FinancialChartProps = {
  ages: number[];
  years: (string | number)[];
  dataProjected: number[];
  dataWithProjects?: number[];
};

export function FinancialChart({
  ages,
  years,
  dataProjected,
  dataWithProjects,
}: FinancialChartProps) {
  const colors = {
    base: "#94a3b8",
    real: "#0ea5e9",
    text: "#334155",
    textLight: "#94a3b8",
    grid: "#f1f5f9",
  };

  const options = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      borderColor: "#e2e8f0",
      borderWidth: 1,
      padding: 12,
      textStyle: { color: colors.text, fontSize: 13 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (params: EChartsParam[] | any) {
        if (!Array.isArray(params)) return "";
        const index = params[0].dataIndex;

        let result = `<div style="margin-bottom: 8px; font-weight: 600; color: ${colors.text}">
                        ${params[0].axisValue} <span style="color:${colors.textLight}; font-weight:400">(${ages[index]} anos)</span>
                      </div>`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params.forEach((item: any) => {
          const val = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          }).format(item.value);

          result += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 20px; font-size: 13px; margin-top: 4px;">
            <div style="display:flex; align-items:center; gap: 6px;">
                <span style="width:8px; height:8px; border-radius:50%; background-color:${item.color};"></span>
                <span style="color: ${colors.text}">${item.seriesName}</span>
            </div>
            <span style="font-weight: 600;">${val}</span>
          </div>`;
        });
        return result;
      },
    },
    grid: {
      left: "2%",
      right: "3%",
      bottom: "3%",
      top: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: years,
      axisLabel: {
        interval: Math.floor(years.length / 6),
        formatter: (value: string) => value.toString(),
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
          color: colors.grid,
        },
      },
    },
    series: [
      {
        name: "Cenário Base",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: colors.base,
          width: 2,
          type: dataWithProjects ? "dashed" : "solid",
        },
        data: dataProjected,
      },
      ...(dataWithProjects
        ? [
            {
              name: "Cenário Projetado",
              type: "line",
              smooth: true,
              showSymbol: false,
              lineStyle: {
                color: colors.real,
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
                    { offset: 0, color: "rgba(14, 165, 233, 0.2)" },
                    { offset: 1, color: "rgba(14, 165, 233, 0)" },
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
    // FIX DO ERRO DISCONNECT: Adicionar um container div explicito em volta
    <div style={{ width: "100%", height: "100%", minHeight: "400px" }}>
      <ReactECharts
        option={options}
        style={{ height: "100%", width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
        theme={"light"}
      />
    </div>
  );
}
