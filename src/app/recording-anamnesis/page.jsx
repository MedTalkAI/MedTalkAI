"use client";

import { useEffect, useState } from "react";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";

const RecordingAnamnesis = () => {
  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10; // Number of items per page
  const pagesVisited = pageNumber * itemsPerPage;

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

  const handleTranscribe = (anamneseRecorded) => {
    setAnamneses(
      anamneses.filter(
        (anamnese) => anamnese.id !== anamneseRecorded.anamnese_id
      )
    );
    toast.success("Anamnesis recorded successfully!");
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

    if (typeof window !== "undefined") {
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
          onIsRecorded={setIsRecorded}
          anamnese_id={selectedAnamnese?.id}
        />
      );
    }
  };

  const handleAnamneseClick = (anamnese) => {
    setSelectedAnamnese(anamnese);
  };

  const renderizarAnamneses = () => {
    const displayedAnamneses = anamneses.slice(
      pagesVisited,
      pagesVisited + itemsPerPage
    );

    return (
      <ul className={Styles.ul}>
        <li className={`${Styles.anamneseHeader} ${Styles.header}`}>
          <span className={Styles.anamneseId}>Nº Anamnesis</span>
          <span className={Styles.anamneseText}>Anamnesis</span>
          <span className={Styles.anamneseWorks}>
            {" "}
            <span class="material-symbols-outlined">arrow_drop_down</span>
            <span>Nº Words</span>
          </span>
        </li>
        {displayedAnamneses.map((anamnese, index) => (
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
              {anamnese.text.split(/\s+/).length}
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

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <div className={Styles.container}>
      <div className={Styles.navbar}>
        <Navbar path="/recording-anamnesis" />
      </div>
      <ToastContainer />
      <div className={Styles.containerAnamnese}>
        <h1 className={Styles.title}>Recording Anamneses</h1>
        <div className={Styles.subTitle}>Record Selected Anamnese</div>
        <div>
          {selectedAnamnese ? (
            <AudioRecorderComponent />
          ) : (
            "Select an anamnese to record."
          )}
        </div>
        <div className={Styles.anamnesisGroup}>
          {anamneses.length > 0 ? renderizarAnamneses() : "No data to display."}
        </div>
        <div className={Styles.paginationContainer}>
          <div className={Styles.details}>
            Anamneses {pagesVisited} a {pagesVisited + 10} de {anamneses.length}
          </div>
          <ReactPaginate
            previousLabel={
              <span class="material-symbols-outlined">arrow_back_ios_new</span>
            }
            nextLabel={
              <span class="material-symbols-outlined">arrow_forward_ios</span>
            }
            pageCount={Math.ceil(anamneses.length / itemsPerPage)}
            onPageChange={handlePageChange}
            containerClassName={Styles.pagination}
            previousLinkClassName={Styles.paginationLink}
            nextLinkClassName={Styles.paginationLink}
            disabledClassName={Styles.paginationDisabled}
            activeClassName={Styles.paginationActive}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingAnamnesis;
