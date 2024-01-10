"use client";

import AudioRecorderComponent from "@/components/AudioRecorderComponent";
import { useState } from "react";

export default function AudioTeste() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState(null);

  const handleAudioUrlChange = (url, name) => {
    setAudioUrl(url);
    setAudioName(name);
  };
  
  return (
    <div>
      <h1>Audio Teste</h1>
      <AudioRecorderComponent onAudioUrlChange={handleAudioUrlChange} />
      {audioUrl && <p>{audioUrl}</p>}
      {audioName && <p>{audioName}</p>}
    </div>
  );
}
