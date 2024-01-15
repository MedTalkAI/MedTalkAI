"use client";

import Navbar from "@/components/Navbar";
import Style from "./Transcription.module.css";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import data from "../../data/db.json";
import ModelStatistics from "@/components/ModelStatistics";
import HistoryTranscription from "@/components/HistoryTranscription";
import { useState } from "react";
import AudioRecorderComponent from "@/components/AudioRecorderComponent";

const transcriptions = data.trancriptions;

const Transcription = () => {
  const [modelTranscription, setModelTranscription] = useState(null);
  const [model, setModel] = useState("Wav2Vec2 + lm5");

  const handleTrascribe = (url, model, date) => {
    setModelTranscription(
      "febre não há ferida e mialgia e dor nas articulações importante em joelhos e tornozelos."
    );
    setModel(model);
    console.log(url, model, date);
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
            <AudioRecorderComponent
              doctor={false}
              onTrascribe={handleTrascribe}
            />
          </div>
          <div className={Style.results}>
            <TranscriptionResult text={modelTranscription} isEditable={false} />
            <TranscriptionResult text={modelTranscription} isEditable={true} />
          </div>
          <div className={Style.metricsContainer}>
            <div className={Style.metrics}>
              <Metrics
                transcription={modelTranscription}
                wer={"0,14"}
                bleu={"0,98"}
                cosine={"0,75"}
                kappa={"0,98"}
              />
            </div>
            {modelTranscription && (
              <div className={Style.model}>
                <ModelStatistics model={model} />
              </div>
            )}
          </div>
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
                  transcription={transcription.model_transcription}
                  date={transcription.date}
                  bleu={transcription.bleu}
                  cosine={transcription.cosine}
                  kappa={transcription.kappa}
                  model={transcription.model}
                  wer={transcription.wer}
                />
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Transcription;
