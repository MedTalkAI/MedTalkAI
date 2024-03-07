"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { AudioRecorder } from "react-audio-voice-recorder";

const RecordingAnamnesis = () => {

  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = "http://127.0.0.1:5000/anamneses";

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage ? localStorage.getItem("access_token") : ""
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
      let name = username + " " + new Date().toLocaleString();
      let date = new Date().toLocaleString();

      const formData = new FormData();
      formData.append("correction", selectedAnamnese.text);
      
      formData.append("model", model);

      await fetch("http://localhost:5000/corrections/" + transcriptionId, {
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
  
  const handleTranscribe = (model, transcription, id) => {
    setTranscription(transcription);
    setModel(model);
    setTranscriptionId(id);
    handleCorrection();
  }

  const anamnesisRecord = () => {
    if(selectedAnamnese === null) {
      return (
        <div className={Styles.infoIcon}>
          <span className="material-symbols-outlined">info</span>
          <p className={Styles.infoMessage}>Select any anamnese and record it</p>
        </div>
      );
    } else {
      return (
          <AudioRecorderComponent path="/recording-anamnesis" onTrascribe = {handleTranscribe()} />
      );
    }
  };
  
  const handleAnamneseClick = (anamnese) => {
    setSelectedAnamnese(anamnese);
  }

  const renderizarAnamneses = () => {
    return anamneses.map((anamnese) => (
      <div className={`${Styles.anamnese} ${selectedAnamnese?.id === anamnese.id ? Styles.selected : ''}`} key={anamnese.id} onClick={() => handleAnamneseClick(anamnese)}>
        <span>{anamnese.text}</span>
      </div>
    ));
  };

  return (
    <div className={Styles.container}>
      <Navbar path="/recording-anamnesis" />
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
