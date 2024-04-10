"use client";

import Navbar from "@/components/Navbar";
import Style from "./RecordedAnamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactAudioPlayer from "react-audio-player";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

import { useState, useEffect, useRef } from "react";
import TranscriptionResult from "@/components/TranscriptionResult";
import ReactPaginate from "react-paginate";

const RecordedAnamnesis = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [editableText, setEditableText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleDeleteConfirmation = () => {
    setIsDeleteModalOpen(true);
  };

  const handleAnamneseClick = (anamnese) => {
    setSelectedTranscription(anamnese);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recordings/${selectedTranscription.id}`,
        {
          method: "DELETE",
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
        // Exclua a transcrição do estado
        const updatedTranscriptions = transcriptions.filter(
          (transcription) => transcription.id !== selectedTranscription.id
        );
        setTranscriptions(updatedTranscriptions);
        setSelectedTranscription(null);
        toast.success("Transcription deleted successfully");
      } else {
        throw new Error("Failed to delete transcription");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transcription");
    }
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const handleUpdateConfirmation = () => {
    setIsModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    updateTranscription();
    setIsModalOpen(false);
  };

  const handleCancelUpdate = () => {
    setIsModalOpen(false);
  };

  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  const updateTranscription = async () => {
    const formData = new FormData();
    formData.append("text", editableText);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/anamneses/${selectedTranscription.anamnese_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
          body: formData,
        }
      );
      if (response.ok) {
        toast.success("Correction updated successfully");
      } else {
        throw new Error("Failed to update correction");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update correction");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user_type");
    setUserType(user);

    if (user == "intern") {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/recordings/user`,
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
            const transcriptions = await response.json();
            console.log(transcriptions);
            setTranscriptions(transcriptions);
          } else {
            throw new Error("Failed to fetch transcriptions");
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchData();
    } else {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/user`,
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
            const transcriptions = await response.json();
            console.log(transcriptions);
            setTranscriptions(transcriptions);
          } else {
            throw new Error("Failed to fetch transcriptions");
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchData();
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedTranscription) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/recordings/${selectedTranscription.id}/audio`,
        {
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        }
      )
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
    }
  }, [selectedTranscription, userType]);

  const handeUpdated = (editableText) => {
    const aux_anamneses = JSON.parse(JSON.stringify(transcriptions));
    const updatedTranscriptions = aux_anamneses.map((anamnese) => {
      if (anamnese.id === selectedTranscription.id) {
        anamnese.anamnese = editableText;
      }
      return anamnese;
    });
    setTranscriptions(updatedTranscriptions);
    setIsModalOpen(false);
    setSelectedTranscription(null);
    toast.success("Anamnesis updated successfully!");
  };

  useEffect(() => {
    if (orderBy === "last") {
      setTranscriptions((prevTranscriptions) => {
        return prevTranscriptions.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
      });
    } else if (orderBy === "oldest") {
      setTranscriptions((prevTranscriptions) => {
        return prevTranscriptions.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
      });
    } else {
    }
    setOpenDropdown(false);
  }, [orderBy]);

  const renderizarAnamneses = () => {
    const displayedAnamneses = transcriptions.slice(
      pagesVisited,
      pagesVisited + itemsPerPage
    );
    return (
      <ul className={Style.ul}>
        <li className={`${Style.anamneseHeader} ${Style.header}`}>
          <span className={Style.anamneseId}>Nº Anamnesis</span>
          <span className={Style.anamneseText}>Anamnesis</span>
          <span className={Style.anamneseWorks}>
            <span>Nº Words</span>
          </span>
        </li>
        {displayedAnamneses.map((anamnese, index) => (
          <li
            className={`${Style.anamnese} ${
              selectedTranscription?.anamnese_id === anamnese.anamnese_id
                ? Style.selected
                : ""
            } ${index % 2 === 0 ? Style.anamneseEven : Style.anamneseOdd}`}
            key={anamnese.id}
            onClick={() => handleAnamneseClick(anamnese)}
          >
            <span className={Style.anamneseId}>{anamnese.anamnese_id}</span>
            <span className={Style.anamneseText}>{anamnese.anamnese}</span>
            <span className={Style.anamneseWorks}>
              {anamnese.anamnese.split(/\s+/).length}
            </span>
            {selectedTranscription?.id === anamnese.id && (
              <button
                className={Style.button}
                onClick={() => {
                  setIsModalOpen(true);
                }}
              >
                <span className="material-symbols-outlined">edit</span>
                <span className={Style.textSpanButton}>Edit Anamnesis</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <Navbar path="/recorded-anamnesis" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <h1 className={Style.title}>Recorded</h1>
          <div className={Style.controls}>
            <h3>Selected anamnese</h3>
            <div className={Style.actionGroup}>
              {selectedTranscription ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <ReactAudioPlayer src={audioSrc} controls />
                  {userType !== "intern" && (
                    <button className={Style.updateButton} onClick={() => {}}>
                      Update Correction
                    </button>
                  )}
                  <button
                    className={Style.deleteButton}
                    onClick={handleDeleteConfirmation}
                  >
                    Delete Anamnese
                  </button>
                </div>
              ) : (
                <div className={Style.info}>
                  <span class="material-symbols-outlined">info</span>
                  <p>
                    You can select any anamnese, listen its audio and update its
                    correction
                  </p>
                </div>
              )}
              <div className={Style.dropdown} ref={dropdownRef}>
                <div
                  className={Style.select}
                  onClick={() => {
                    setOpenDropdown(!openDropdown);
                  }}
                >
                  <p>Order by {orderBy}</p>
                  {!openDropdown && (
                    <span class="material-symbols-outlined">expand_more</span>
                  )}
                  {openDropdown && (
                    <span class="material-symbols-outlined">expand_less</span>
                  )}
                </div>
                {openDropdown && (
                  <div className={Style.menu}>
                    {orderBy != "" && (
                      <div
                        className={Style.item}
                        onClick={() => {
                          setOrderBy("");
                        }}
                      >
                        Default
                      </div>
                    )}
                    <div
                      className={Style.item}
                      onClick={() => {
                        setOrderBy("last");
                      }}
                    >
                      Last
                    </div>
                    <div
                      className={Style.item}
                      onClick={() => {
                        setOrderBy("oldest");
                      }}
                    >
                      Oldest
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className={Style.anamnesisGroup}>
            {transcriptions && renderizarAnamneses()}
          </div>
          <div className={Style.paginationContainer}>
            <div className={Style.details}>
              Anamneses {pagesVisited} a {transcriptions.length > 10 ?(pagesVisited + 10 > transcriptions.length ? transcriptions.length : pagesVisited + 10)  : transcriptions.length} de{" "}
              {transcriptions.length}
            </div>
            <ReactPaginate
              previousLabel={
                <span class="material-symbols-outlined">
                  arrow_back_ios_new
                </span>
              }
              nextLabel={
                <span class="material-symbols-outlined">arrow_forward_ios</span>
              }
              pageCount={Math.ceil(transcriptions.length / itemsPerPage)}
              onPageChange={handlePageChange}
              containerClassName={Style.pagination}
              previousLinkClassName={Style.paginationLink}
              nextLinkClassName={Style.paginationLink}
              disabledClassName={Style.paginationDisabled}
              activeClassName={Style.paginationActive}
            />
          </div>
        </main>
      </div>
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
        <h2>Editing anamnese #{selectedTranscription?.anamnese_id}</h2>
        <div className={Style.results}>
          <TranscriptionResult
            text={selectedTranscription?.anamnese}
            isEditable={false}
          />
          <TranscriptionResult
            text={selectedTranscription?.anamnese}
            isEditable={true}
            onSave={handeUpdated}
            transcription_id={selectedTranscription?.anamnese_id}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={handleCancelDelete}
        contentLabel="Delete Confirmation"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "400px",
            height: "200px",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2>Delete Confirmation</h2>
        <p>Are you sure you want to delete the transcription?</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={Style.buttonOk} onClick={handleConfirmDelete}>
            Yes
          </button>
          <button className={Style.buttonCancel} onClick={handleCancelDelete}>
            No
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default RecordedAnamnesis;
