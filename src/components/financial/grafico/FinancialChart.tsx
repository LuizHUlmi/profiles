// src/components/grafico/GraficoFinanceiro.tsx

import ReactECharts from "echarts-for-react";

type GraficoFinanceiroProps = {
  ages: number[];
  years: string[];
  dataProjected: number[];
};

export function GraficoFinanceiro({
  ages,
  years,
  dataProjected,
}: GraficoFinanceiroProps) {
  const options = {
    title: {
      text: "Projeção de Patrimônio",
      left: "center",
      textStyle: { color: "#333", fontSize: 18, fontWeight: "normal" },
    },
    tooltip: {
      trigger: "axis",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: function (params: any[]) {
        // No tooltip, mostramos o mês exato (ex: Jan/2025)
        let result = `<div style="font-size: 14px; margin-bottom: 5px;">${
          params[0].axisValue // Mostra "Jan/2025"
        } (${ages[params[0].dataIndex]} anos)</div>`;

        params.forEach(function (item) {
          result += `<div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${
              item.color
            };"></span>
            <span style="flex-grow: 1; margin-right: 10px;">${
              item.seriesName
            }:</span>
            <span style="font-weight: bold;">${new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(item.value)}</span>
          </div>`;
        });
        return result;
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#ccc",
      borderWidth: 1,
      padding: [10, 15],
    },
    legend: {
      bottom: 0,
      data: [{ name: "Patrimônio Total", icon: "circle" }],
      textStyle: { color: "#555" },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: years,
      axisLabel: {
        // --- AQUI ESTÁ O TRUQUE ---
        // Como temos dados mensais, 12 pontos = 1 ano.
        // interval: 59 significa: mostre o rótulo a cada 60 pontos (5 anos).
        interval: 59,
        formatter: (value: string, index: number) => {
          // value vem como "Jan/2025". Pegamos só o ano.
          const ano = value.split("/")[1];
          return `${ano}\n${ages[index]} anos`;
        },
        color: "#777",
      },
      axisLine: { lineStyle: { color: "#ccc" } },
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
        color: "#777",
      },
      splitLine: { lineStyle: { type: "dashed", color: "#e0e0e0" } },
      axisLine: { show: false },
    },
    series: [
      {
        name: "Patrimônio Total",
        type: "line",
        smooth: true, // Deixa a curva mensal bem suave
        symbol: "none",
        lineStyle: {
          color: "#FF9800",
          width: 3,
        },
        areaStyle: {
          color: "rgba(255, 152, 0, 0.2)",
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
