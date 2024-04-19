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
    }
    setOpenDropdown(false);
  }, [orderBy]);

  return (
    <div>
      <Navbar path="/anamnesis" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <div className={Style.head}>
            <h1 className={Style.title}>Anamnesis</h1>
            <div className={Style.options}>
              <button className={Style.benchmark} disabled>
                <span class="material-symbols-outlined">bubble_chart</span>
                Benchmark
              </button>
              <button className={Style.upload}>
                <span class="material-symbols-outlined">upload_file</span>
                Upload Anamnesis
              </button>
            </div>
          </div>
          <div className={Style.recordingsTag}>
            <div className={Style.tag}>
              <span class="material-symbols-outlined">audio_file</span>
              10 recordings ready to be transcribed
            </div>
            <button className={Style.secondaryButton} disabled>
              Transcribe
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Anamnesis;
