"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ReactLoading from "react-loading";
import ReactAudioPlayer from "react-audio-player";
import AnamneseChart from "@/components/AnamneseChart";
import SimpleTable from "@/components/SimpleTable";
import AudioStats from "@/components/AudioStats";
import Style from "./Recording.module.css";

export default function Recording() {
  const { id } = useParams();
  const [recordingInfo, setRecordingInfo] = useState(null);
  const [audioSrc, setAudioSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [transcriptions, setTranscriptions] = useState([]);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recordings/${id}`,
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
          setRecordingInfo(data);
        } else {
          throw new Error("Failed to fetch transcription");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTranscription();

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/recordings/${id}/audio`, {
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
    if (recordingInfo) {
      const fetchTranscriptionFromOtherModels = async () => {
        try {
          const formData = new FormData();
          formData.append("audio_src", recordingInfo.audio_path);

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
            setTranscriptions(data);
          } else {
            throw new Error("Failed to fetch transcription");
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchTranscriptionFromOtherModels();
    }
  }, [recordingInfo]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <Navbar path="/recordings" />
      <CheckAuthExpiration />
      <div className={Style.content}>
        <div className={Style.head}>
          <div className={Style.buttonVoltar}>
            <a href="\recordings" style={{ textDecoration: "none" }}>
              Recordings
            </a>
            <span className="material-symbols-outlined">arrow_back_ios</span>
            <p>Recording {id}</p>
          </div>
          <h1 className={Style.title}>Recording {id}</h1>
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
        {recordingInfo && (
          <>
            <div className={Style.audio}>
              <div className={Style.metadata_cont}>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">audio_file</span>
                  <p>Recorded at {formatDate(recordingInfo.recorded_at)}</p>
                </div>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">
                    record_voice_over
                  </span>
                  <p>Recorded by {recordingInfo.user}</p>
                </div>
                <div className={Style.metadata}>
                  <span className="material-symbols-outlined">description</span>
                  <p>Anamnesis nº {recordingInfo.anamnese_id}</p>
                </div>
              </div>
              <div className={Style.controls}>
                <ReactAudioPlayer src={audioSrc} controls />
                <span>{recordingInfo.audio_path}</span>
              </div>
            </div>
            <div className="anamnese">
              <div className={Style.transcription}>
                <h3>Original Text</h3>
                <div className={Style.correct}>{recordingInfo?.anamnese}</div>
              </div>
              <div className={Style.evaluation}>
                <div className={Style.metrics}>
                  <AnamneseChart
                    dataSets={transcriptions}
                    title={"Metrics from this recording"}
                  />
                </div>
                <div className={Style.other}>
                  <SimpleTable
                    data={transcriptions}
                    current={id}
                    title={"Transcriptions"}
                  />
                  <AudioStats data={transcriptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
