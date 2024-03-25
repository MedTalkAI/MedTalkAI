"use client";

import Navbar from "@/components/Navbar";
import Style from "./Anamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useRef, useState } from "react";

const Anamnesis = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [orderBy, setOrderBy] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/transcriptions`,
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
  }, []);

  return (
    <div>
      <Navbar path="/anamnesis" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <h1 className={Style.title}>Anamnesis</h1>
          <div className={Style.controls}>
            <h3>Selected anamnese</h3>
            <div className={Style.actionGroup}>
              <div className={Style.info}>
                <span class="material-symbols-outlined">info</span>
                <p>You can select any anamnese, see all metrics about it</p>
              </div>

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
              <a
                href={"/anamnese/" + transcription.id}
                key={index}
                style={{ textDecoration: "none" }}
              >
                <div className={Style.anamnese} key={index}>
                  <p>{transcription.latest_correction}</p>
                  <span className={Style.modelName}>
                    {transcription.model_name}
                  </span>
                  <span className={Style.modelMetric}>
                    WER {parseFloat(transcription.wer).toFixed(2)}
                  </span>
                  <span className={Style.modelMetric}>
                    BLEU:{parseFloat(transcription.bleu).toFixed(2)}
                  </span>
                  <span className={Style.modelMetric}>
                    COSINE SIMILARITY:{" "}
                    {parseFloat(transcription.cosine).toFixed(2)}{" "}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Anamnesis;
