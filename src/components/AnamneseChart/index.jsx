import { Chart } from "chart.js/auto";
import { useEffect, useRef } from "react";
import "./AnamneseChart.module.css";

const AnamneseChart = ({ dataSets, labels, metric = "wer" }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (
      chartRef &&
      chartRef.current &&
      dataSets.length > 0 &&
      labels.length > 0
    ) {
      const data = {
        labels: labels,
        datasets: [
          {
            label: metric,
            data: dataSets.map((data) => data[metric]),
            fill: true,
            borderColor: "rgb(58, 118, 157)",
            backgroundColor: "rgba(58, 118, 157, 0.1)", // Set the background color with opacity
            tension: 0.1,
          },
        ],
      };

      const myChart = new Chart(chartRef.current, {
        type: "line",
        data: data,
        options: {
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const dataIndex = context.dataIndex;
                  const datasetIndex = context.datasetIndex;
                  const correction = dataSets[dataIndex];

                  let label = `Correction: ${correction.correction}\n`;
                  label += `${metric.toUpperCase()}: ${correction[metric]}\n`;

                  return label;
                },
              },
            },
          },
          legend: {
            display: false,
          },
        },
      });

      // Retorna a função de limpeza ao desmontar o componente
      return () => myChart.destroy();
    }
  }, [chartRef, dataSets, labels, metric]);

  return (
    <div className="chart">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default AnamneseChart;
