"use client";

import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { useState, useEffect } from "react";
import Style from "./Anamnese.module.css";
import ReactAudioPlayer from "react-audio-player";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import AnamneseChart from "@/components/AnamneseChart";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

const Anamnese = () => {
  const { id } = useParams();
  const [transcription, setTranscription] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [audioSrc, setAudioSrc] = useState("");
  const [dataSets, setDataSets] = useState([]);
  const [labels, setLabels] = useState([]);
  const [metric, setMetric] = useState("wer");

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/${id}?correction=true`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${
                typeof window !== "undefined" && window.localStorage
                  ? localStorage.getItem("access_token")
                  : ""
              }`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTranscription(data);
          setCorrections(data.corrections);
          // Extracting data for chart
          const newLabels = data.corrections.map((correction) => {
            return correction.date.split(" ")[0]; // Extracting data
          });

          const newDataSets = data.corrections.map((correction) => {
            return correction;
          });

          setLabels(newLabels);
          setDataSets(newDataSets);
        } else {
          throw new Error("Failed to fetch transcription");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTranscription();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcriptions/audio/${id}`, {
      headers: {
        Authorization: `Bearer ${
          typeof window !== "undefined" && window.localStorage
            ? localStorage.getItem("access_token")
            : ""
        }`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        }
        throw new Error("Network response was not ok.");
      })
      .then((blob) => {
        const audioURL = URL.createObjectURL(blob);
        setAudioSrc(audioURL);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /**
   @todo: Add radar chart: https://www.chartjs.org/docs/latest/charts/radar.html
  **/

  return (
    <div>
      <Navbar />
      <CheckAuthExpiration />
      <div className={Style.anamnese}>
        <div className={Style.head}>
          <div className={Style.buttonVoltar}>
            <a href="\anamnesis">Transcriptions</a>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            <p>Transcription {id}</p>
          </div>
          <h1 className={Style.title}>Anamnese {id}</h1>
        </div>
        {transcription && (
          <>
            <div className={Style.audio}>
              <div className={Style.metadata_cont}>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">audio_file</span>
                  <p>Recorded at {formatDate(transcription.date)}</p>
                </div>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">
                    bubble_chart
                  </span>
                  <p>Transcribed by {transcription.model}</p>
                </div>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">
                    record_voice_over
                  </span>
                  <p>Recorded by {transcription.user}</p>
                </div>
                {transcription.anamnese_id && (
                  <div className={Style.metadata}>
                    <span className="material-symbols-outlined">
                      description
                    </span>
                    <p>Provided by Hapvida</p>
                  </div>
                )}
              </div>
              <div className={Style.controls}>
                <ReactAudioPlayer src={audioSrc} controls />
              </div>
            </div>
            <div className={Style.content}>
              <div className={Style.texts}>
                <TranscriptionResult
                  isEditable={false}
                  text={transcription?.transcription}
                />
                <TranscriptionResult
                  isEditable={true}
                  text={transcription?.latest_correction}
                />
              </div>
              <div className={Style.metrics}>
                <Metrics
                  bleu={parseFloat(transcription.bleu)}
                  cosine={parseFloat(transcription.cosine)}
                  kappa={parseFloat(transcription.kappa)}
                  transcription={transcription.transcription}
                  wer={parseFloat(transcription.wer)}
                />
                <div className={Style.selection}>
                  <h3>Historic Metrics: </h3>
                  <select
                    onChange={(e) => {
                      setMetric(e.target.value);
                    }}
                    value={metric}
                  >
                    <option value={"wer"}>WER</option>
                    <option value={"bleu"}>BLEU</option>
                    <option value={"cosine"}>COSINE SIMILARITY</option>
                  </select>
                </div>
                <AnamneseChart
                  dataSets={dataSets}
                  labels={labels}
                  metric={metric}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Anamnese;
