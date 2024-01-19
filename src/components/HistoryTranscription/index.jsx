"use client";
import Style from "./HistoryTranscription.module.css";
import { useState, useEffect } from "react";

const HistoryTranscription = ({ transcription }) => {
  let doctor = false;
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      doctor = user.type === "doctor";
    }
  }, []);
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={Style.history} onClick={handleExpand}>
      <p className={Style.transciption}>
        {doctor
          ? transcription.corrected_transcription
          : expanded
          ? transcription.model_transcription
          : transcription.model_transcription.length >= 200
          ? transcription.model_transcription.slice(0, 200) + "..."
          : transcription.model_transcription}
      </p>
      {!doctor && (
        <>
          <span
            className={Style.model}
            style={{ display: expanded ? "inline" : "none" }}
          >
            Modelo: {transcription.model}
          </span>
          <ul
            className={Style.metrics}
            style={{ display: expanded ? "block" : "none" }}
          >
            <li>
              <b>WER:</b> {transcription.wer}
            </li>
            <li>
              <b>BLEU:</b> {transcription.bleu}
            </li>
            <li>
              <b>COSINE SIMILARITY:</b> {transcription.cosine}
            </li>
            <li>
              <b>KAPPA:</b> {transcription.kappa}
            </li>
          </ul>
        </>
      )}
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: doctor ? "end" : "space-between",
          alignItems: "center",
        }}
      >
        {!doctor && (
          <button className={Style.button}>
            {expanded ? "- Shrink" : "+ Expand"}
          </button>
        )}
        <span className={Style.date}>{transcription.date}</span>
      </div>
    </div>
  );
};

export default HistoryTranscription;
