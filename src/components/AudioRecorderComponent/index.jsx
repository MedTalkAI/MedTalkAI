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
    console.log(blob);
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    const name =
      "Audio recorded from browser [" + new Date().toLocaleString() + "]";
    setAudioName(name);
  };

  // Function to fetch audio from URL and convert it to a blob
  const fetchAndConvertAudio = async (url) => {
    const response = await fetch(url);
    const audioBlob = await response.blob();
    return audioBlob;
  };

  // Function to convert blob to File object
  const blobToFile = (blob, fileName) => {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  };

  // Function to handle transcription
  const handleTranscribe = async () => {
    setLoading(true);

    try {
      // Fetch and convert audio
      const audioBlob = await fetchAndConvertAudio(audioUrl);

      // Convert blob to File object
      const audioFile = blobToFile(audioBlob, "audio.wav"); // You can specify the desired filename and extension here

      // Create FormData
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("model", model);
      formData.append("date", new Date().getDate().toString());

      // Submit FormData via fetch
      const response = await fetch("http://localhost:5000/transcription", {
        method: "POST",
        body: formData,
      });

      // Handle response as needed
      const data = await response.json();
      console.log(data); // Log or handle the response data

      // Handle transcription
      onTrascribe(
        audioUrl,
        model,
        data.transcription
      );
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
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
            <option value="Wav2Vec 2.0 Fine-tuned">
              Wav2Vec 2.0 Fine-tuned
            </option>
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
