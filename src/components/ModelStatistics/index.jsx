import Style from "./ModelStatistics.module.css"

const ModelStatistics = ({ model, wers, bleus, cosines }) => {
  const renderTable = () => {
    const metrics = ["Average", "Variance", "SD"];
    const data = [
      { metric: "WER", values: [wers.mean, wers.variance, wers.std_deviation] },
      {
        metric: "BLEU",
        values: [bleus.mean, bleus.variance, bleus.std_deviation],
      },
      {
        metric: "COSINE SIMILARITY",
        values: [cosines.mean, cosines.variance, cosines.std_deviation],
      },
    ];

    return (
      <table className={Style.table}>
        <thead>
          <tr>
            <th></th>
            {metrics.map((metric, index) => (
              <th className={Style.metric} key={index}>{metric}</th>
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
      <h1 className={Style.title}>Model Statistics ({model})</h1>
      {renderTable()}
    </div>
  );
};

export default ModelStatistics;
