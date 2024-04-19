"use client";

import Navbar from "@/components/Navbar";
import FilterItem from "@/components/FilterItem";
import Style from "./Anamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactLoading from "react-loading";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useRef, useState } from "react";

const Anamnesis = () => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [recordingsToBe, setRecordingsToBe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState(["Original", "Hapvida"]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

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
          setUsers(
            transcriptions
              .map((transcription) => transcription.user_id)
              .filter((user_id, index, self) => self.indexOf(user_id) === index)
          );
          setModels(
            transcriptions
              .map((transcription) => transcription.model_name)
              .filter(
                (model_name, index, self) => self.indexOf(model_name) === index
              )
          );
        } else {
          throw new Error("Failed to fetch transcriptions");
        }
      } catch (error) {
        console.error(error);
      }
    };
    const fetchRecordings = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recordings?count=true&status=false`,
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
          const recordings = await response.json();
          setRecordingsToBe(recordings.count);
        } else {
          throw new Error("Failed to fetch recordings");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRecordings();
    fetchData();
    setLoading(false);
  }, []);

  const handleFilterChange = (filterName, selectedOptions) => {
    if (filterName === "Model") {
      setSelectedModels(selectedOptions);
    } else if (filterName === "Type") {
      setSelectedTypes(selectedOptions);
    } else if (filterName === "User") {
      setSelectedUsers(selectedOptions);
    }
  };
  const handleResetFilters = () => {
    setSelectedModels([]);
    setSelectedTypes([]);
    setSelectedUsers([]);
  };

  const filteredTranscriptions = transcriptions.filter((transcription) => {
    const modelFilter =
      selectedModels.length === 0 ||
      selectedModels.includes(transcription.model_name);
    const typeFilter =
      selectedTypes.length === 0 ||
      selectedTypes.includes(
        transcription.anamnese_id === null ? "Original" : "Hapvida"
      );
    const userFilter =
      selectedUsers.length === 0 ||
      selectedUsers.includes(transcription.user_id);
    return modelFilter && typeFilter && userFilter;
  });

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
          {recordingsToBe > 0 && (
            <div className={Style.recordingsTag}>
              <div className={Style.tag}>
                <span class="material-symbols-outlined">audio_file</span>
                {recordingsToBe} recordings ready to be transcribed
              </div>
              <button className={Style.secondaryButton} disabled>
                Transcribe
              </button>
            </div>
          )}
          {loading && (
            <div className={Style.loading}>
              <ReactLoading
                type="spinningBubbles"
                color="#001D3B"
                height={"5%"}
                width={"5%"}
              />
              <p>Loading...</p>
            </div>
          )}
          {transcriptions.length > 0 && (
            <div>
              <div className={Style.filterContainer}>
                <div className={Style.filterIcon}>
                  <span class="material-symbols-outlined">filter_list</span>
                </div>

                <div className={Style.filters}>
                  <div className={Style.filterList}>
                    <FilterItem
                      filterName={"Model"}
                      filterOptions={models}
                      selectedOptions={selectedModels}
                      onChange={(selectedOptions) =>
                        handleFilterChange("Model", selectedOptions)
                      }
                    />
                    <FilterItem
                      filterName={"Type"}
                      filterOptions={types}
                      selectedOptions={selectedTypes}
                      onChange={(selectedOptions) =>
                        handleFilterChange("Type", selectedOptions)
                      }
                    />
                    <FilterItem
                      filterName={"User"}
                      filterOptions={users}
                      selectedOptions={selectedUsers}
                      onChange={(selectedOptions) =>
                        handleFilterChange("User", selectedOptions)
                      }
                    />
                  </div>

                  {(selectedModels.length > 0 ||
                    selectedTypes.length > 0 ||
                    selectedUsers.length > 0) && (
                    <div
                      className={Style.resetFilters}
                      onClick={handleResetFilters}
                    >
                      <span class="material-symbols-outlined">refresh</span>
                      Reset Filters
                    </div>
                  )}
                </div>
              </div>
              <div>
                {filteredTranscriptions.map((transcription) => (
                  <div
                    style={{
                      border: "1px solid #ccc",
                    }}
                  >
                    <div>
                      <span>{transcription.transcription}</span>
                    </div>
                    <div>
                      <span>{transcription.model_name}</span>
                    </div>
                    <div>
                      <span>{transcription.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Anamnesis;
