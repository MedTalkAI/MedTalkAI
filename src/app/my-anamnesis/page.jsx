"use client";

import Navbar from "@/components/Navbar";
import Style from "./MyAnamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactAudioPlayer from "react-audio-player";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

import { useState, useEffect, useRef } from "react";

const MyAnamnesis = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  const [editableText, setEditableText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

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
        `http://127.0.0.1:5000/corrections/${selectedTranscription.id}`,
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
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/transcriptions/user",
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
    }
  }, [selectedTranscription]);

  return (
    <div>
      <Navbar path="/my-anamnesis" />
      <div className={Style.content}>
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
                  <ReactAudioPlayer src="path/to/audio/file.mp3" controls />
                  <button
                    className={Style.updateButton}
                    onClick={handleUpdateConfirmation}
                  >
                    Update Correction
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
                        setOrderBy("Date");
                      }}
                    >
                      Date
                    </div>
                    <div
                      className={Style.item}
                      onClick={() => {
                        setOrderBy("Name");
                      }}
                    >
                      Name
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
                    value={editableText}
                    onChange={(e) => {
                      setEditableText(e.target.value);
                    }}
                  ></textarea>
                ) : (
                  <>
                    <p>{transcription.latest_correction}</p>
                    <div className={Style.data}>
                      <span>
                        {new Date(transcription.date).toLocaleDateString(
                          "en-GB"
                        )}
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
    </div>
  );
};

export default MyAnamnesis;
