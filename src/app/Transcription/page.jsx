"use client";

import Navbar from "@/components/Navbar";
import Style from "./Transcription.module.css";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import data from "../../data/db.json";
import ModelStatistics from "@/components/ModelStatistics";
import HistoryTranscription from "@/components/HistoryTranscription";
import { useState, useEffect } from "react";
import AudioRecorderComponent from "@/components/AudioRecorderComponent";

const transcriptions = data.trancriptions;

const Transcription = () => {
  let doctor = false;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    doctor = user.type === "doctor";
  }

  const [modelTranscription, setModelTranscription] = useState(null);
  const [correctedTranscription, setCorrectedTranscription] = useState(null);
  const [model, setModel] = useState("Wav2Vec 2.0 + lm5");

  const [metrics, setMetrics] = useState(null);

  const handleTrascribe = (url, model, date, result) => {
    setModelTranscription(result);
    setModel(model);
    console.log(url, model, date);
  };

  const handleCorrection = (correctedText, resultMetrics) => {
    setCorrectedTranscription(correctedText);
    setMetrics(resultMetrics);
    console.log(metrics)
  };

  return (
    <div className={Style.transcription}>
      <header>
        <Navbar />
      </header>
      <div className={Style.content}>
        <main>
          <h1 className={Style.title}>Analysis</h1>
          <div className={Style.controls}>
            <AudioRecorderComponent onTrascribe={handleTrascribe} />
          </div>
          <div className={Style.results}>
            <TranscriptionResult text={modelTranscription} isEditable={false} />
            <TranscriptionResult
              text={modelTranscription}
              isEditable={true}
              onSave={handleCorrection}
            />
          </div>
          {!doctor && (
            <div className={Style.metricsContainer}>
              <div className={Style.metrics}>
                <Metrics
                  transcription={modelTranscription}
                  wer={metrics?.metrics.wer}
                  bleu={metrics?.metrics.bleu}
                  cosine={metrics?.metrics.cosine_similarity}
                  kappa={"-"}
                />
              </div>
              {modelTranscription && (
                <div className={Style.model}>
                  <ModelStatistics model={model} />
                </div>
              )}
            </div>
          )}
        </main>
        <aside>
          <h1 className={Style.title}>History</h1>
          <div className={Style.historyTranscriptions}>
            {transcriptions
              .slice()
              .sort((a, b) => {
                const dateA = new Date(a.date.split("/").reverse().join("-"));
                const dateB = new Date(b.date.split("/").reverse().join("-"));
                return dateB - dateA;
              })
              .map((transcription) => (
                <HistoryTranscription
                  key={transcription.id}
                  transcription={transcription}
                />
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Transcription;
