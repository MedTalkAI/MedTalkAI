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
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

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
  const [transcription_id, setTranscription_id] = useState(null);
  const [isRecorded, setIsRecorded] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const handleTrascribe = (model, result, id) => {
    setModelTranscription(result);
    setModel(model);
    setTranscription_id(id);
  };

  const handleCorrection = async (correctedText) => {
    try {
      setCorrectedTranscription(correctedText);

      const formData = new FormData();
      formData.append("correction", correctedText);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/corrections/${transcription_id}`,
        {
          method: "POST",
          body: formData,
        }
      );
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/metrics/model/${encodeURIComponent(
          model,
          "utf-8"
        )}`,
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
      <CheckAuthExpiration />

      <Navbar path="/transcription" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <h1 className={Style.title}>Transcription</h1>
          <div className={Style.controls}>
            <AudioRecorderComponent
              onTrascribe={handleTrascribe}
              onIsRecorded={setIsRecorded}
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
        </main>
      </div>
    </div>
  );
};

export default Transcription;
