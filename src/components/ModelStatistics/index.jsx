import React from "react";
import Style from "./ModelStatistics.module.css";
import { useRouter } from "next/navigation";
import { MdDownload } from "react-icons/md";

const ModelStatistics = ({ statistics, onCsvDownloader }) => {
  const router = useRouter();
  
  const handlePretrain = () => {
    router.push(`/pretrain/${statistics.name}`);
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
          statistics?.wer?.mean || "N/A",
          statistics?.wer?.variance || "N/A",
          statistics?.wer?.std_deviation || "N/A",
        ],
      },
      {
        metric: "BLEU",
        values: [
          statistics?.bleu?.mean || "N/A",
          statistics?.bleu?.variance || "N/A",
          statistics?.bleu?.std_deviation || "N/A",
        ],
      },
      {
        metric: "COSINE SIMILARITY",
        values: [
          statistics?.cosine?.mean || "N/A",
          statistics?.cosine?.variance || "N/A",
          statistics?.cosine?.std_deviation || "N/A",
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
                <td key={idx}>
                  {typeof value === "number" ? value.toFixed(3) : value}
                </td>
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
        <h1 className={Style.title}>{statistics.name}</h1>       
      </div>

      <div style={{ overflowX: "auto" }}>{renderTable()}</div>
      <div className={Style.bottom}>
        <span>Transcriptions quantity: {statistics?.transcriptions_amt}</span>
        <button onClick={handlePretrain}>Fine-tuning</button>
        <button onClick={()=>onCsvDownloader(statistics.id)} className={Style.exportarBenchmark}>
          <MdDownload />
        </button>
      </div>
    </div>
  );
}; 

export default ModelStatistics;
