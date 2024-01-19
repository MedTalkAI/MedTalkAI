"use client";

import React, { useState, useEffect } from "react";
import Style from "./ModelStatistics.module.css";
import { useRouter } from "next/navigation";

const ModelStatistics = ({ model }) => {
  const router = useRouter();
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:4000/models");
        const data = await response.json();
        // Assuming the data array contains multiple models and you want to find the one with the matching name
        const selectedModel = data.find((item) => item.name === model);
        setStatistics(selectedModel);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [model]);

  const handlePretrain = () => {
    router.push(`/pretrain/${model}`);
  };

  const renderTable = () => {
    if (!statistics) {
      return <p>Loading...</p>;
    }

    const metrics = ["Mean", "Variance", "SD"];

    const data = [
      {
        metric: "WER",
        values: [
          statistics.wer.mean,
          statistics.wer.variance,
          statistics.wer.std_deviation,
        ],
      },
      {
        metric: "BLEU",
        values: [
          statistics.bleu.mean,
          statistics.bleu.variance,
          statistics.bleu.std_deviation,
        ],
      },
      {
        metric: "COSINE SIMILARITY",
        values: [
          statistics.cosine.mean,
          statistics.cosine.variance,
          statistics.cosine.std_deviation,
        ],
      },
    ];

    return (
      <table className={Style.table}>
        <thead>
          <tr>
            <th></th>
            {metrics.map((metric, index) => (
              <th className={Style.metric} key={index}>
                {metric}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <th className={Style.metric}>{row.metric}</th>
              {row.values.map((value, idx) => (
                <td key={idx}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <div className={Style.head}>
        <h1 className={Style.title}>Model Statistics ({model})</h1>
        <button onClick={handlePretrain}>Continued pretraining</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        {renderTable()}
      </div>
    </div>
  );
};

export default ModelStatistics;
