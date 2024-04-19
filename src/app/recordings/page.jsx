"use client";

import Navbar from "@/components/Navbar";
import Style from "./Recordings.module.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import FilterItem from "@/components/FilterItem";

const Recordings = () => {
  const [recordings, setRecordings] = useState([]);
  const [statusOptions, setStatusOptions] = useState([true, false]);
  const [users, setUsers] = useState([]);
  const [recordingsToBe, setRecordingsToBe] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recordings`,
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
          setRecordings(recordings);
          setUsers(
            recordings
              .map((recording) => recording.user)
              .filter((user, index, self) => self.indexOf(user) === index)
          );
          setRecordingsToBe(
            recordings.filter((recording) => recording.status === false).length
          );
        } else {
          throw new Error("Failed to fetch recordings");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (filterName, selectedOptions) => {
    if (filterName === "Status") {
      setSelectedStatus(selectedOptions);
    } else if (filterName === "User") {
      setSelectedUser(selectedOptions);
    }
  };

  const handleResetFilters = () => {
    setSelectedStatus([]); // Reset status filter
    setSelectedUser([]); // Reset user filter
  };

  const statusTranslation = {
    true: "Transcribed",
    false: "Not Transcribed",
  };

  const filteredRecordings = recordings.filter((recording) => {
    const statusFilter =
      selectedStatus.length === 0 ||
      selectedStatus.includes(statusTranslation[recording.status]);
    const userFilter =
      selectedUser.length === 0 || selectedUser.includes(recording.user);
    return statusFilter && userFilter;
  });

  return (
    <div>
      <Navbar path="/recordings" />
      <div className={Style.content}>
        <ToastContainer />
        <main>
          <div className={Style.head}>
            <h1 className={Style.title}>Recordings</h1>
            <div className={Style.options}>
              <button className={Style.secondaryButton} disabled>
                <span class="material-symbols-outlined">audio_file</span>
                Generate Transcriptions
              </button>
            </div>
          </div>
          {recordingsToBe > 0 && (
            <div className={Style.recordingsTag}>
              <div className={Style.tag}>
                <span class="material-symbols-outlined">audio_file</span>
                {recordingsToBe} recordings ready to be transcribed
              </div>
            </div>
          )}
          <div className={Style.filterContainer}>
            <div className={Style.filterIcon}>
              <span class="material-symbols-outlined">filter_list</span>
            </div>

            <div className={Style.filters}>
              <div className={Style.filterList}>
                <FilterItem
                  filterName={"Status"}
                  filterOptions={["Transcribed", "Not Transcribed"]}
                  selectedOptions={selectedStatus}
                  onChange={(selectedOptions) =>
                    handleFilterChange("Status", selectedOptions)
                  }
                />
                <FilterItem
                  filterName={"User"}
                  filterOptions={users}
                  selectedOptions={selectedUser}
                  onChange={(selectedOptions) =>
                    handleFilterChange("User", selectedOptions)
                  }
                />
              </div>

              {selectedStatus.length > 0 ||
                (selectedUser.length > 0 && (
                  <div
                    className={Style.resetFilters}
                    onClick={handleResetFilters}
                  >
                    <span class="material-symbols-outlined">refresh</span>
                    Reset Filters
                  </div>
                ))}
            </div>
          </div>
          <div className={Style.recordings}>
            {filteredRecordings.map((recording) => (
              <div className={Style.recording}>
                <div className={Style.recordingInfo}>
                  <div>
                    <h2>{recording.id}</h2>
                  </div>
                </div>
                <div className={Style.recordingUser}>{recording.user}</div>
                <div className={Style.recordingUser}>
                  {recording.recorded_at}
                </div>
                <div className={Style.recordingUser}>
                  {recording.anamnese_id}
                </div>
                <div
                  className={`${Style.status} ${
                    recording.status ? Style.done : Style.undone
                  }`}
                >
                  <span class="material-symbols-outlined">
                    {true ? "check_circle" : "cancel"}
                  </span>
                  Transcribed
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Recordings;
