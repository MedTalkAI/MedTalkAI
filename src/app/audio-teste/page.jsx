"use client";

import AudioRecorderComponent from "@/components/AudioRecorderComponent";
import { useState } from "react";

export default function AudioTeste() {
  const [audioUrl, setAudioUrl] = useState(null);

  const handleAudioUrlChange = (url) => {
    setAudioUrl(url);
  };

  return (
    <div style={{margin: '300px 250px'}}>
      {/* <h1>Audio Teste</h1> */}
      <div>
        <AudioRecorderComponent onAudioUrlChange={handleAudioUrlChange} />
      </div>
    </div>
  );
}
