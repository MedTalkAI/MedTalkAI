"use client";

import Navbar from "@/components/Navbar";
import Style from "./MyAnamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactAudioPlayer from "react-audio-player";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

import { useState, useEffect, useRef } from "react";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

const MyAnamnesis = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  const [editableText, setEditableText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [audioSrc, setAudioSrc] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userType, setUserType] = useState(null);

  const handleDeleteConfirmation = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/${
          userType == "intern" ? "bolsista/" : ""
        }${selectedTranscription.id}`,
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
    formData.append("correction", editableText);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/corrections/${selectedTranscription.id}`,
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
            `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/bolsista/user`,
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
      setEditableText(selectedTranscription.latest_correction);
      textareaRef.current.focus();

      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/${
          userType == "intern" ? "bolsista" : "audio"
        }/${selectedTranscription.id}${userType == "intern" ? "/audio" : ""}`,
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
  }, [selectedTranscription]);

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

  return (
    <div>
      <Navbar path="/my-anamnesis" />
      <div className={Style.content}>
        <CheckAuthExpiration />
        <ToastContainer />
        <main>
          <h1 className={Style.title}>My Anamnesis</h1>
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
                    <button
                      className={Style.updateButton}
                      onClick={handleUpdateConfirmation}
                    >
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
            {transcriptions.map((transcription, index) => (
              <div
                className={
                  Style.anamnese +
                  (selectedTranscription === transcription
                    ? " " + Style.selectedTranscription
                    : "")
                }
                key={index}
                onClick={() => {
                  setSelectedTranscription(transcription);
                }}
              >
                {selectedTranscription === transcription ? (
                  <textarea
                    ref={textareaRef}
                    value={
                      userType == "intern"
                        ? transcription.anamnese_id
                        : editableText
                    }
                    onChange={
                      userType == "intern"
                        ? ""
                        : (e) => {
                            setEditableText(e.target.value);
                          }
                    }
                    contentEditable={userType == "intern" ? false : true}
                  ></textarea>
                ) : (
                  <>
                    <p>
                      {userType == "intern"
                        ? transcription.anamnese_id
                        : transcription.latest_correction}
                    </p>
                    <div className={Style.data}>
                      <span>
                        {new Date(
                          userType == "intern"
                            ? transcription.recorded_at
                            : transcription.date
                        ).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancelUpdate}
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
            width: "400px",
            height: "200px",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2>Update Confirmation</h2>
        <p>Are you sure you want to update the fix?</p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={Style.buttonOk} onClick={handleConfirmUpdate}>
            Yes
          </button>
          <button className={Style.buttonCancel} onClick={handleCancelUpdate}>
            No
          </button>
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

export default MyAnamnesis;
