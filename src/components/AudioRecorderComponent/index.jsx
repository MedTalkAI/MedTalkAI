import { useState } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import styles from "./AudioRecorderComponent.module.css";

const AudioRecorderComponent = ({ onTrascribe, doctor }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [model, setModel] = useState("");

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
        {!doctor && (
          <select onChange={(e) => setModel(e.target.value)}>
            <option value="" disabled selected>
              Select a model
            </option>
            <option value="wav2vec2">Wav2Vec2</option>
            <option value="hubert">HuBert</option>
            <option value="whisper">Whisper</option>
            <option value="wav2vec2 + lm5">Wav2Vec2 + lm5</option>
          </select>
        )}
      </div>
      {audioUrl && audioName && (
        <div className={styles.result}>
          <p>{audioName}</p>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
      <button disabled={model === "" || !audioUrl} onClick={handleTranscribe}>
        Transcribe
      </button>
    </main>
  );
};

export default AudioRecorderComponent;
