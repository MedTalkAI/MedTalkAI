"use client";
import Style from "./HistoryTranscription.module.css";
import { useState } from "react";

const HistoryTranscription = ({
  transcription,
  model,
  wer,
  bleu,
  cosine,
  kappa,
  date,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={Style.history} onClick={handleExpand}>
      <p className={Style.transciption}>
        {expanded
          ? transcription
          : transcription.length >= 200
          ? transcription.slice(0, 200) + "..."
          : transcription}
      </p>
      <span
        className={Style.model}
        style={{ display: expanded ? "inline" : "none" }}
      >
        Modelo: {model}
      </span>
      <ul
        className={Style.metrics}
        style={{ display: expanded ? "block" : "none" }}
      >
        <li>WER: {wer}</li>
        <li>BLEU: {bleu}</li>
        <li>COSINE SIMILARITY: {cosine}</li>
        <li>KAPPA: {kappa}</li>
      </ul>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button className={Style.button}>
          {expanded ? "- Shrink" : "+ Expand"}
        </button>
        <span className={Style.date}>{date}</span>
      </div>
    </div>
  );
};

export default HistoryTranscription;
