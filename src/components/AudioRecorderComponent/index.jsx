import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";

const AudioRecorderComponent = ({ onAudioUrlChange }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState(null);

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    const name = "Audio recorded from browser at " + new Date().toLocaleString();
    setAudioName(name);
    onAudioUrlChange(url, name);
  };

  return (
    <div>
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        onNotAllowedOrFound={(err) => console.table(err)}
        downloadOnSavePress={false}
        downloadFileExtension="webm"
        showVisualizer={true}
      />
      {audioUrl && (
        <div>
          <audio controls src={audioUrl}></audio>
          <p>{audioName}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorderComponent;
