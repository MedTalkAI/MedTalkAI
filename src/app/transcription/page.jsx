"use client";

import Navbar from "@/components/Navbar";
import Style from "./Transcription.module.css";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import ModelStatistics from "@/components/ModelStatistics";
import { useState, useEffect } from "react";
import AudioRecorderComponent from "@/components/AudioRecorderComponent";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Transcription = () => {
  let doctor = false;
  let username = "";
  const user =
    typeof window !== "undefined" && window.localStorage
      ? JSON.parse(localStorage.getItem("user"))
      : "";
  if (user) {
    doctor = user.type == 0;
    username = user.username;
  }

  function toastedErrror(message) {
    toast.error(message);
  }

  const [modelTranscription, setModelTranscription] = useState(null);
  const [correctedTranscription, setCorrectedTranscription] = useState(null);
  const [model, setModel] = useState("Wav2Vec 2.0 + lm5");
  const [transcription_id, setTranscription_id] = useState(null);

  const [metrics, setMetrics] = useState(null);

  const handleTrascribe = (model, result, id) => {
    setModelTranscription(result);
    setModel(model);
    setTranscription_id(id);
    console.log(encodeURIComponent(model, "utf-8"));
  };

  const handleCorrection = async (correctedText, resultMetrics) => {
    try {
      setCorrectedTranscription(correctedText);
      setMetrics(resultMetrics);
      console.log(correctedText, resultMetrics);

      let name = username + " " + new Date().toLocaleString();
      let date = new Date().toLocaleString();

      const formData = new FormData();
      formData.append("name", name);
      formData.append("date", date);
      formData.append("model_transcription", modelTranscription);
      formData.append("corrected_transcription", correctedText);
      formData.append("wer", Number(metrics?.metrics?.wer.toFixed(2)));
      formData.append("bleu", Number(metrics?.metrics?.bleu.toFixed(2)));
      formData.append(
        "cosine",
        Number(metrics?.metrics.cosine_similarity.toFixed(2))
      );
      formData.append("model", model);
      formData.append("user", username);

      await fetch("http://localhost:5000/corrections/" + transcription_id, {
        method: "POST",
        body: formData,
      });
      await fetch(
        "http://localhost:5000/metrics/model/" +
          encodeURIComponent(model, "utf-8"),
        {
          method: "POST",
        }
      );

      toast.success("Anamnesis saved successfully!");
      setCorrectedTranscription(null);
      setModelTranscription(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={Style.transcription}>
      <Navbar path="/transcription" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <h1 className={Style.title}>Transcription</h1>
          <div className={Style.controls}>
            <AudioRecorderComponent
              onTrascribe={handleTrascribe}
              toastedErrror={toastedErrror}
            />
          </div>
          <div className={Style.results}>
            <TranscriptionResult text={modelTranscription} isEditable={false} />
            <TranscriptionResult
              text={modelTranscription}
              isEditable={true}
              onSave={handleCorrection}
              transcription_id={transcription_id}
            />
          </div>
          {!doctor == true && (
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
              {correctedTranscription && (
                <div className={Style.model}>
                  <ModelStatistics model={model} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Transcription;
