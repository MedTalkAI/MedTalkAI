import React from "react";
import Style from "./ModelStatistics.module.css";

const ModelStatistics = ({ model, onCsvDownloader }) => {
  const renderTable = () => {
    if (!model) {
      return <p>Loading...</p>;
    }

    const metrics = ["Mean", "Variance", "SD"];

    const data = [
      {
        metric: "WER",
        values: [
          model?.wer?.mean || "N/A",
          model?.wer?.variance || "N/A",
          model?.wer?.std_deviation || "N/A",
        ],
      },
      {
        metric: "BLEU",
        values: [
          model?.bleu?.mean || "N/A",
          model?.bleu?.variance || "N/A",
          model?.bleu?.std_deviation || "N/A",
        ],
      },
      {
        metric: "COSINE SIMILARITY",
        values: [
          model?.cosine?.mean || "N/A",
          model?.cosine?.variance || "N/A",
          model?.cosine?.std_deviation || "N/A",
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
                <td key={idx}>{parseFloat(value).toFixed(3)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className={Style.container}>
      <div className={`${Style.model} ${model.standard ? Style.standard : ""}`}>
        <div style={{ height: "18px" }}>
          {model.standard && (
            <p className={Style.default}>Default Model Used By MedTalk AI</p>
          )}
        </div>
        <div className={Style.head}>
          <h1 className={Style.title}>{model.name}</h1>
          <button
            onClick={() => onCsvDownloader(model.id)}
            className={Style.download}
          >
            <span class="material-symbols-outlined">file_save</span>
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>{renderTable()}</div>
        <div className={Style.bottom}>
          <p>Transcriptions quantity: {model?.transcriptions_amt}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <button className={Style.secondaryButton} disabled>Fine-tuning</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelStatistics;
