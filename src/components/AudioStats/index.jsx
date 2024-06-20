import React, { use, useEffect, useState } from "react";
import Style from "./AudioStats.module.css";

const calculateStats = (data) => {
    const werValues = data.map(d => parseFloat(d.wer));
    const cosineValues = data.map(d => parseFloat(d.cosine));
    const bleuValues = data.map(d => parseFloat(d.bleu));
  
    const mean = (values) => values.reduce((a, b) => a + b, 0) / values.length;
    const variance = (values) => {
      const avg = mean(values);
      return mean(values.map(val => (val - avg) ** 2));
    };
    const std = (values) => Math.sqrt(variance(values));
  
    return {
      wer: {
        mean: mean(werValues),
        std: std(werValues),
        variance: variance(werValues),
      },
      cosine: {
        mean: mean(cosineValues),
        std: std(cosineValues),
        variance: variance(cosineValues),
      },
      bleu: {
        mean: mean(bleuValues),
        std: std(bleuValues),
        variance: variance(bleuValues),
      },
    };
  };

const AudioStats = ({ data }) => {
  const [stats, setStats] = useState();

  useEffect(() => {
    if (data.length > 1) {
        const calculatedStats = calculateStats(data);
        setStats(calculatedStats);
      }
  }, [data]);

  return (
    <div className={Style.audioStats}>
      <h3>Audio Evaluation Stats</h3>
      {stats && (
        <div className={Style.stats}>
          <div>
            <h4>WER</h4>
            <p>Mean: {stats.wer.mean.toFixed(3)}</p>
            <p>Standard Deviation: {stats.wer.std.toFixed(3)}</p>
            <p>Variance: {stats.wer.variance.toFixed(3)}</p>
          </div>
          <div>
            <h4>Cosine</h4>
            <p>Mean: {stats.cosine.mean.toFixed(3)}</p>
            <p>Standard Deviation: {stats.cosine.std.toFixed(3)}</p>
            <p>Variance: {stats.cosine.variance.toFixed(3)}</p>
          </div>
          <div>
            <h4>BLEU</h4>
            <p>Mean: {stats.bleu.mean.toFixed(3)}</p>
            <p>Standard Deviation: {stats.bleu.std.toFixed(3)}</p>
            <p>Variance: {stats.bleu.variance.toFixed(3)}</p>
          </div>
        </div>
      )}
      {data.length <= 1 && (
        <div className={Style.error}>
          <p>No transcriptions from other models</p>
        </div>
      )}
    </div>
  );
};

export default AudioStats;
