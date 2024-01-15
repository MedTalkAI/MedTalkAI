import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import styles from "./AudioRecorderComponent.module.css";

const AudioRecorderComponent = ({ onTrascribe }) => {
  const storedUser = localStorage.getItem("user");

  let doctor = false;

  if (storedUser) {
    const user = JSON.parse(storedUser);
    doctor = user.type === "doctor";
  }
  
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [model, setModel] = useState("Wav2Vec2 + lm5");

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    const name =
      "Audio recorded from browser [" + new Date().toLocaleString() + "]";
    setAudioName(name);
  };

  const handleTranscribe = () => {
    const formData = new FormData();
    formData.append("audio", audioUrl);
    formData.append("model", model);
    formData.append("date", new Date().getDate().toString());
    onTrascribe(audioUrl, model, new Date().getDate().toString());
  };

  return (
    <main className={styles.containter}>
      <div className={styles.select_form}>
        <AudioRecorder
          onRecordingComplete={addAudioElement}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }}
          onNotAllowedOrFound={(err) => console.table(err)}
          downloadOnSavePress={true}
          downloadFileExtension="webm"
          showVisualizer={true}
        />

        {audioUrl && audioName && (
          <div className={styles.result}>
            <audio controls src={audioUrl} />
          </div>
        )}
        {!doctor && (
          <select onChange={(e) => setModel(e.target.value)} value={model}>
            <option value="" disabled>
              Select a model
            </option>
            <option value="Wav2Vec2">Wav2Vec2</option>
            <option value="HuBert">HuBert</option>
            <option value="Whisper">Whisper</option>
            <option value="Wav2Vec2 + lm5">Wav2Vec2 + lm5</option>
          </select>
        )}
        <button disabled={model === "" || !audioUrl} onClick={handleTranscribe}>
          Transcribe
        </button>
      </div>
    </main>
  );
};

export default AudioRecorderComponent;
