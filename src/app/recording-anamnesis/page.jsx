"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/component/Navbar/Navbar.jsx";
import { AudioRecorder } from "react-audio-voice-recorder";

const RecordingAnamnesis = () => {
  const [selectedAnamnese, setSelectedAnamnese] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recorder, setRecorder] = useState(null)

  const [audioName, setAudioName] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAnamnese(null);
  }, []);

  const handleAnamneseClick = (index) => {
    setSelectedAnamnese((prevState) => prevState === index ? null : index);
  }
  const clearAudioName = () => {
    setAudioName(null);
  };
  const addAudioElement = () => {
    setAudioName("Audio recorded from browser [" + new Date().toLocaleString() + "]");
  };

  const anamnesisRecord = () => {
    if(selectedAnamnese===null){
      return(
          <div className="info-icon">
            <span className="material-symbols-outlined">
              info
            </span>
            <p className="info-message">Select any anamnese and record it</p>
          </div>
        );
    }
    else{
      return(
        <div className="info-icon">
          < AudioRecorderComponent path = "/recording-anamnesis" />
        </div>
      );
    }
  }
  const renderizarAnamneses = () => {
    return textosAnamneses.map((texto, index) => (
      <div className={`anamnese ${selectedAnamnese === index ? 'selected' : ''}`} key={index} onClick={() => handleAnamneseClick(index)}>
        <span>{texto}</span>
      </div>
    ));
  };

  return (
    <main>
      <Navbar path="/recording-anamnesis" />
      <div className="container">
        <h1 className="title">Record Anamneses</h1>
        <p className="sub-title">Record Selected Anamnese</p>
        {anamnesisRecord()}
        <div className='anamnesisGroup'>
          {renderizarAnamneses()}
        </div>
      </div>
    </main>
  );
}
export default RecordingAnamnesis;
