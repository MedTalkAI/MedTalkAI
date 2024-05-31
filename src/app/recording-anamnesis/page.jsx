"use client";

import { useEffect, useState } from "react";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import TranscriptionResult from "@/components/TranscriptionResult";
import ReactPaginate from "react-paginate";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

const RecordingAnamnesis = () => {
  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isEditAnamnese, setIsEditAnamnese] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonAux, setIsButtonAux] = useState(-1);
  const [isEdit, setIsEdit] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10;
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
          setAnamneses(data.sort((a, b) => a.id - b.id));
        } else {
          throw new Error("Failed to fetch anamneses");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log(selectedAnamnese);
  }, [selectedAnamnese]);

  const handleUpdated = (editableText) => {
    console.log("editableText");
    console.log(editableText);
    const aux_anamneses = JSON.parse(JSON.stringify(anamneses));
    const updatedAnamneses = aux_anamneses.map((anamnese) => {
      if (anamnese.id === selectedAnamnese.id) {
        anamnese.text = editableText;
      }
      return anamnese;
    });
    setAnamneses(updatedAnamneses);
    setIsModalOpen(false);
    setSelectedAnamnese(null);
    toast.success("Anamnesis updated successfully!");
  };
  /**
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
 */

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
    if (isModalOpen && anamnese.id != isButtonAux) {
      setIsModalOpen(false);
    }
    setSelectedAnamnese(anamnese);
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const RenderizarAnamneses = () => {
    const handleEditButtonClick = (anamnese) => {
      setIsButtonAux(anamnese.id);
      setIsModalOpen(true);
      setIsEdit(anamnese.id);
    };

    const displayedAnamneses = anamneses.slice(
      pagesVisited,
      pagesVisited + itemsPerPage
    );

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={`${Styles.anamneseHeader} ${Styles.header}`}>
              <TableCell className={`${Styles.anamneseId}`}>
                Nº Anamnesis
              </TableCell>
              <TableCell className={`${Styles.anamneseText}`}>
                Anamnesis
              </TableCell>
              <TableCell className={`${Styles.anamneseWorks}`}>
                Nº Words
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedAnamneses.map((anamnese, index) => (
              <TableRow
                className={`${Styles.anamnese} ${
                  selectedAnamnese?.id === anamnese.id ? Styles.selected : ""
                } ${
                  index % 2 === 0 ? Styles.anamneseEven : Styles.anamneseOdd
                }`}
                key={anamnese.id}
                onClick={() => handleAnamneseClick(anamnese)}
              >
                <TableCell className={`${Styles.anamneseId}`}>
                  {anamnese.id}
                </TableCell>
                {selectedAnamnese?.id === anamnese.id &&
                isEdit === anamnese.id ? (
                  <TableCell className={`${Styles.anamneseText}`}>
                    <TranscriptionResult
                      className={Styles.editable}
                      text={selectedAnamnese?.text}
                      isEditable={true}
                      onSave={handleUpdated}
                      transcription_id={selectedAnamnese?.id}
                    />
                  </TableCell>
                ) : (
                  <>
                    {selectedAnamnese?.id === anamnese.id ? (
                      <TableCell className={`${Styles.anamneseText}`}>
                        <TranscriptionResult
                          className={Styles.nonEditable}
                          text={selectedAnamnese?.text}
                          isEditable={false}
                        />
                        {selectedAnamnese?.id === anamnese.id && (
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              className={Styles.button}
                              onClick={() => handleEditButtonClick(anamnese)}
                            >
                              <span className="material-symbols-outlined">
                                edit
                              </span>
                              <span className={Styles.textSpanButton}>
                                Editar Anamnesis
                              </span>
                            </button>
                          </div>
                        )}
                      </TableCell>
                    ) : (
                      <>
                        <TableCell className={`${Styles.anamneseText}`}>
                          <span className={Styles.anamneseTextSpan}>
                            {anamnese.text}
                          </span>
                        </TableCell>
                      </>
                    )}
                  </>
                )}
                <TableCell className={`${Styles.anamneseWorks}`}>
                  {anamnese.text.split(/\s+/).length}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
    /**
    return (
      <ul className={Styles.ul}>
        <li className={`${Styles.anamneseHeader} ${Styles.header}`}>
          <span className={Styles.anamneseId}>Nº Anamnesis</span>
          <span className={Styles.anamneseText}>Anamnesis</span>
          <span className={Styles.anamneseWorks}>
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
              {selectedAnamnese?.id === anamnese.id && isEdit === anamnese.id ? (
                <div className={Styles.conteinerAnamnese}>
                  <TranscriptionResult
                    className={Styles.editable}
                    text={selectedAnamnese?.text}
                    isEditable={true}
                    onSave={handleUpdated}
                    transcription_id={selectedAnamnese?.id}
                  />
                </div>
              ) : (
                  <>
                  {selectedAnamnese?.id === anamnese.id ? (
                    <div className={Styles.conteinerSelectedAnamnese}>
                      <TranscriptionResult
                        className={Styles.nonEditable}
                        text={selectedAnamnese?.text}
                        isEditable={false}
                      />
                      {selectedAnamnese?.id === anamnese.id && (
                        <div
                          style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
                        >
                          <button
                            className={Styles.button}
                            onClick={() => handleEditButtonClick(anamnese)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                            <span className={Styles.textSpanButton}>
                              Editar Anamnesis
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={Styles.conteinerAnamnese}>
                      <span>{anamnese.id}</span>
                      <span className={Styles.anamneseText}>{anamnese.text}</span>
                      <span className={Styles.anamneseWorks}>
                        {anamnese.text.split(/\s+/).length}
                      </span>
                    </div>
                  )}
                </>
                
              )}

          </li>
        ))}
      </ul>
    );*/
  };

  useEffect(() => {
    console.log("isModalOpen");
    console.log(isModalOpen);
    console.log("isFixed");
    console.log(isFixed);
  }, [isModalOpen]);

  return (
    <div className={Styles.container}>
      <CheckAuthExpiration />
      <div className={!isModalOpen && isFixed ? Styles.fixedNavbar : ""}>
        <Navbar path="/recording-anamnesis" />
      </div>
      <ToastContainer />
      <div className={Styles.containerAnamnese}>
        <h1 className={Styles.title}>Recording Anamneses</h1>
        <div className={!isModalOpen && isFixed ? Styles.fixedContent : ""}>
          <p className={Styles.subTitle}>Record Selected Anamnese</p>
          <div>{anamnesisRecord()}</div>
        </div>
        <div className={Styles.anamnesisGroup}>
          {anamneses && <RenderizarAnamneses />}
        </div>
        <div className={Styles.paginationContainer}>
          <div className={Styles.details}>
            Anamneses {pagesVisited} a{" "}
            {anamneses.length > 10
              ? pagesVisited + 10 > anamneses.length
                ? anamneses.length
                : pagesVisited + 10
              : anamneses.length}{" "}
            de {anamneses.length}
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
      {/**
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setSelectedAnamnese(null);
        }}
        contentLabel="Confirmação de Atualização"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width:
              typeof window !== "undefined" ? window.innerWidth * 0.8 : "80%",
            height:
              typeof window !== "undefined" ? window.innerHeight * 0.6 : "60%",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h1>Editing anamnese #{selectedAnamnese?.id}</h1>
        <div className={Styles.results}>
          <TranscriptionResult
            text={selectedAnamnese?.text}
            isEditable={true}
            onSave={handeUpdated}
            transcription_id={selectedAnamnese?.id}
            title={"Anamnesis"}
          />
        </div>
      </Modal>**/}
    </div>
  );
};

export default RecordingAnamnesis;
