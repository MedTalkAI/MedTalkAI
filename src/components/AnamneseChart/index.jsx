import { Chart } from "chart.js/auto";
import { useEffect, useRef, useState } from "react";
import Style from "./AnamneseChart.module.css";

const AnamneseChart = ({ dataSets, title }) => {
  const chartRef = useRef();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (chartRef && chartRef.current && dataSets.length > 0) {
      const data = {
        labels: ["WER", "Cosine", "BLEU"],
        datasets: dataSets.map((dataSet) => {
          const r = Math.floor(Math.random() * 256);
          const g = Math.floor(Math.random() * 256);
          const b = Math.floor(Math.random() * 256);

          return {
            label: dataSet.model,
            data: [dataSet.wer, dataSet.cosine, dataSet.bleu],
            fill: true,
            borderColor: `rgb(${r}, ${g}, ${b})`,
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
            pointBackgroundColor: `rgb(${r}, ${g}, ${b})`,
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: `rgb(${r}, ${g}, ${b})`,
            pointHitRadius: 5,
            pointRadius: 5,
          };
        }),
      };

      const myChart = new Chart(chartRef.current, {
        type: "radar",
        data: data,
        options: {
          scales: {
            r: {
              angleLines: {
                display: false,
              },
              suggestedMin: 0,
              suggestedMax: 1,
            },
          },
          legend: {
            display: false,
          },
        },
      });

      return () => myChart.destroy();
    }
  }, [chartRef, dataSets, refreshKey]);


  const handleRefreshColors = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <div className={Style.chart}>
      <div className={Style.head}>
        <h2>{title ? title : "Comparassion with other models"}</h2>
        <button onClick={handleRefreshColors} disabled={dataSets.length <= 1}>
          <span className="material-symbols-outlined">palette</span>
          Switch Colors
        </button>
      </div>
      {dataSets.length > 1 && <canvas ref={chartRef}></canvas>}
      {dataSets.length <= 1 && (
        <div className={Style.error}>
          <p>No transcriptions from other models</p>
        </div>
      )}
    </div>
  );
};

export default AnamneseChart;
