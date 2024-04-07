"use client";

import { useEffect, useState } from "react";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RecordingAnamnesis = () => {
  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    setSelectedAnamnese(null);
    const fetchData = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/anamneses?recorded=false`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAnamneses(data);
        } else {
          throw new Error("Failed to fetch anamneses");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleCorrection = async () => {
    try {
      console.log(selectedAnamnese.text);
      console.log(model);
      console.log(transcriptionId);

      const formData = new FormData();
      formData.append("correction", selectedAnamnese.text);

      formData.append("model", model);
      if (transcriptionId && selectedAnamnese.text && model)
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/corrections/${transcriptionId}`,
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${
                typeof window !== "undefined" && window.localStorage
                  ? localStorage.getItem("access_token")
                  : ""
              }`,
            },
          }
        );

      toast.success("Anamnesis saved successfully!");
      setCorrectedTranscription(null);
      setSelectedAnamnese(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTranscribe = (model, transcription, id) => {
    setTranscription(transcription);
    setModel(model);
    setTranscriptionId(id);
    handleCorrection();
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > 0) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  const anamnesisRecord = () => {
    if (selectedAnamnese === null) {
      return (
        <div className={Styles.infoIcon}>
          <span className="material-symbols-outlined">info</span>
          <p className={Styles.infoMessage}>
            Select any anamnese and record it
          </p>
        </div>
      );
    } else {
      return (
        <AudioRecorderComponent
          path="/recording-anamnesis"
          onTrascribe={handleTranscribe}
          anamnese_id={selectedAnamnese?.id}
        />
      );
    }
  };

  const handleAnamneseClick = (anamnese) => {
    setSelectedAnamnese(anamnese);
  };

  
  const renderizarAnamneses = () => {
    return (
      <ul className={Styles.ul}>
        <li className={`${Styles.anamneseHeader} ${Styles.header}`}>
          <span className={Styles.anamneseId}>Nº Anamnesis</span>
          <span className={Styles.anamneseText}>Anamnesis</span>
          <span className={Styles.anamneseWorks}> <span class="material-symbols-outlined">
              arrow_drop_down
            </span>
            <span>Nº Words</span>
          </span>
        </li>
        {anamneses.map((anamnese, index) => (
          <li
            className={`${Styles.anamnese} ${
              selectedAnamnese?.id === anamnese.id ? Styles.selected : ""
            } ${index % 2 === 0 ? Styles.anamneseEven : Styles.anamneseOdd}`}
            key={anamnese.id}
            onClick={() => handleAnamneseClick(anamnese)}
          >
            <span className={Styles.anamneseId}>{anamnese.id}</span>
            <span className={Styles.anamneseText}>{anamnese.text}</span>
            <span className={Styles.anamneseWorks}>
              {((anamnese.text).split(/\s+/)).length}
            </span>
            {selectedAnamnese?.id === anamnese.id && (
              <button className={Styles.button}>
                <span className="material-symbols-outlined">edit</span>
                <span className={Styles.textSpanButton}>Edit Anamnesis</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };
  
  
  return (
    <div className={Styles.container}>
      <div className={isFixed ? Styles.fixedNavbar : ""}>
        <Navbar path="/recording-anamnesis" />
      </div>
      <ToastContainer />
      <div className={Styles.containerAnamnese}>
        <h1 className={Styles.title}>Recording Anamneses</h1>
        <div className={isFixed ? Styles.fixedContent : ""}>
          <p className={Styles.subTitle}>Record Selected Anamnese</p>
          <div>{anamnesisRecord()}</div>
        </div>
        <div className={Styles.anamnesisGroup}>
          {anamneses && renderizarAnamneses()}
        </div>
      </div>
    </div>
  );
};

export default RecordingAnamnesis;
