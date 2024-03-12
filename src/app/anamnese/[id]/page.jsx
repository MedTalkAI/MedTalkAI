"use client";

import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { useState, useEffect } from "react";
import Style from "./Anamnese.module.css";
import ReactAudioPlayer from "react-audio-player";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import AnamneseChart from "@/components/AnamneseChart";

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
          console.log(data);
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
  }, []);

  useEffect(() => {
    console.log("transcription");
    console.log(transcription);
  }, [transcription]);

  return (
    <div>
      <Navbar />
      <div className={Style.anamnese}>
        <h1 className={Style.title}>Anamnese {id}</h1>
        <div className={Style.controls}>
          <ReactAudioPlayer src={audioSrc} controls />
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
            {transcription && (
              <Metrics
                bleu={transcription.bleu}
                cosine={transcription.cosine}
                kappa={transcription.kappa}
                transcription={transcription.transcription}
                wer={transcription.wer}
              />
            )}
            {transcription && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anamnese;
