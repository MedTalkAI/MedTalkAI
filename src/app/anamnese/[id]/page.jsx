"use client";

import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import Style from "./Anamnese.module.css";
import ReactAudioPlayer from "react-audio-player";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import AnamneseChart from "@/components/AnamneseChart";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";
import SimpleTable from "@/components/SimpleTable";
import AudioStats from "@/components/AudioStats";

const Anamnese = () => {
  const { id } = useParams();
  const [transcription, setTranscription] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [transcriptionsFromOtherModels, setTranscriptionsFromOtherModels] =
    useState([]);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/${id}`,
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
          // Extracting data for chart
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
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (transcription) {
      const fetchTranscriptionFromOtherModels = async () => {
        try {
          const formData = new FormData();
          formData.append("audio_src", transcription.audio_src);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/audio`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${
                  localStorage.getItem("access_token") || ""
                }`,
              },
              body: formData,
            }
          );

          if (response.ok) {
            const data = await response.json();
            setTranscriptionsFromOtherModels(data);
          } else {
            throw new Error("Failed to fetch transcription");
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchTranscriptionFromOtherModels();
    }
  }, [transcription]);

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
      <Navbar path={"/anamnesis"} />
      <CheckAuthExpiration />
      <div className={Style.anamnese}>
        <div className={Style.head}>
          <div className={Style.buttonVoltar}>
            <a href="\anamnesis">Transcriptions</a>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            <p>Transcription {id}</p>
          </div>
          <h1 className={Style.title}>Transcription {id}</h1>
        </div>
        {loading && (
          <div className={Style.loading}>
            <ReactLoading
              type="spinningBubbles"
              color="#001D3B"
              height={"100px"}
              width={"100px"}
            />
            <p>Loading...</p>
          </div>
        )}
        {transcription && !loading && (
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
                <span>{transcription.audio_src}</span>
              </div>
            </div>
            <div className={Style.content}>
              <div className={Style.texts}>
                <div className={Style.transcription}>
                  <h3>Model Transcript</h3>
                  <div className={Style.model}>
                    {transcription?.transcription}
                  </div>
                </div>
                <div className={Style.transcription}>
                  <h3>Correct Transcript</h3>
                  <div className={Style.correct}>
                    {transcription?.latest_correction}
                  </div>
                </div>
              </div>
              <div className={Style.evaluation}>
                <div className={Style.metrics}>
                  <Metrics
                    bleu={parseFloat(transcription.bleu)}
                    cosine={parseFloat(transcription.cosine)}
                    transcription={transcription.transcription}
                    wer={parseFloat(transcription.wer)}
                  />
                  <AnamneseChart dataSets={transcriptionsFromOtherModels} />
                </div>
                <div className={Style.other}>
                  <SimpleTable
                    data={transcriptionsFromOtherModels}
                    current={id}
                  />
                  <AudioStats data={transcriptionsFromOtherModels} />
                </div>
              </div>
            </div>
          </>
        )}
        {!transcription && !loading && (
          <div className={Style.error}>
            <p>Failed to fetch transcription</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anamnese;
