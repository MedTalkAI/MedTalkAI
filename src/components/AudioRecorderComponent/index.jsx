import { useState, useEffect } from "react";
import { AudioRecorder } from "react-audio-voice-recorder";
import ReactLoading from "react-loading";
import styles from "./AudioRecorderComponent.module.css";

const AudioRecorderComponent = ({ onTrascribe }) => {
  const [loading, setLoading] = useState(false);

  let doctor = false;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    doctor = user.type === "doctor";
  }

  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState(null);
  const [model, setModel] = useState("Wav2Vec 2.0 + lm5");

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    const name =
      "Audio recorded from browser [" + new Date().toLocaleString() + "]";
    setAudioName(name);

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "audio.mp3"; // Set the desired file name with .mp3 extension

    // Append the link to the DOM (optional)
    document.body.appendChild(downloadLink);

    // Trigger a click event on the link to start the download
    downloadLink.click();

    // Remove the link from the DOM (optional, but recommended)
    document.body.removeChild(downloadLink);
  };

  const handleTranscribe = () => {
    setLoading(true);
    setTimeout(() => {
      const formData = new FormData();
      formData.append("audio", audioUrl);
      formData.append("model", model);
      formData.append("date", new Date().getDate().toString());
      onTrascribe(audioUrl, model, new Date().getDate().toString());
      setLoading(false);
    }, 2000);
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
          downloadOnSavePress={false}
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
            <option value="Wav2Vec 2.0">Wav2Vec 2.0</option>
            <option value="HuBert">HuBert</option>
            <option value="Whisper">Whisper</option>
            <option value="Wav2Vec 2.0 + lm5">Wav2Vec 2.0 + lm5</option>
          </select>
        )}
        <button
          disabled={model === "" || !audioUrl || loading}
          onClick={handleTranscribe}
        >
          {loading ? "Loading..." : "Transcribe"}
        </button>
        {loading && (
          <ReactLoading
            type="spinningBubbles"
            color="#001D3B"
            height={"3%"}
            width={"3%"}
          />
        )}
      </div>
    </main>
  );
};

export default AudioRecorderComponent;
