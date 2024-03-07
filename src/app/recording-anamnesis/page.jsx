"use client";

import { useEffect, useState } from "react";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecordingAnamnesis = () => {
  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);

  useEffect(() => {
    setSelectedAnamnese(null);
    const fetchData = async () => {
      try {
        let url = "http://127.0.0.1:5000/anamneses?recorded=false";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAnamneses(data);
        } else {
          throw new Error("Failed to fetch anamneses");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleCorrection = async () => {
    try {
      console.log(selectedAnamnese.text);
      console.log(model);
      console.log(transcriptionId);

      const formData = new FormData();
      formData.append("correction", selectedAnamnese.text);

      formData.append("model", model);
      if (transcriptionId && selectedAnamnese.text && model)
        await fetch("http://localhost:5000/corrections/" + transcriptionId, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        });

      toast.success("Anamnesis saved successfully!");
      setCorrectedTranscription(null);
      setSelectedAnamnese(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTranscribe = (model, transcription, id) => {
    setTranscription(transcription);
    setModel(model);
    setTranscriptionId(id);
    handleCorrection();
  };

  const anamnesisRecord = () => {
    if (selectedAnamnese === null) {
      return (
        <div className={Styles.infoIcon}>
          <span className="material-symbols-outlined">info</span>
          <p className={Styles.infoMessage}>
            Select any anamnese and record it
          </p>
        </div>
      );
    } else {
      return (
        <AudioRecorderComponent
          path="/recording-anamnesis"
          onTrascribe={handleTranscribe}
          anamnese_id={selectedAnamnese?.id}
        />
      );
    }
  };

  const handleAnamneseClick = (anamnese) => {
    setSelectedAnamnese(anamnese);
  };

  const renderizarAnamneses = () => {
    return anamneses.map((anamnese) => (
      <div
        className={`${Styles.anamnese} ${
          selectedAnamnese?.id === anamnese.id ? Styles.selected : ""
        }`}
        key={anamnese.id}
        onClick={() => handleAnamneseClick(anamnese)}
      >
        <span>{anamnese.text}</span>
      </div>
    ));
  };

  return (
    <div className={Styles.container}>
      <Navbar path="/recording-anamnesis" />
      <ToastContainer />
      <div className={Styles.containerAnamnese}>
        <h1 className={Styles.title}>Recording Anamneses</h1>
        <p className={Styles.subTitle}>Record Selected Anamnese</p>
        {anamnesisRecord()}
        <div className={Styles.anamnesisGroup}>
          {anamneses && renderizarAnamneses()}
        </div>
      </div>
    </div>
  );
};

export default RecordingAnamnesis;
