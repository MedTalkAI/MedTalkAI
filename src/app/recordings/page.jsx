"use client";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Navbar from "@/components/Navbar";
import Style from "./Recordings.module.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import FilterItem from "@/components/FilterItem";
import ReactPaginate from "react-paginate";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TableContainer,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import ReactAudioPlayer from "react-audio-player";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F1F2F7",
    color: "#000000",
    fontWeight: "bold",
    fontSize: 15,
    fontFamily: "Inter",
    borderBottom: "2px solid #838383",
  },
  [`&.${tableCellClasses.body}`]: {
    fontFamily: "Inter",
    fontSize: 15,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: "#F8F9FD",
  },
  "&:nth-of-type(odd)": {
    backgroundColor: "#ffffff",
  },
  // hide last border
  "& td, & th": {
    border: 0,
  },
}));

const headCells = [
  { id: "id", label: "Nº Anamnesis" },
  { id: "anamnese", label: "Anamnesis" },
  { id: "user", label: "User" },
  { id: "recorded_at", label: "Date" },
  { id: "status", label: "Status" },
];

function RTableHead({ order, orderBy, onRequestSort }) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
            className={Style.tableHeading}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const Recordings = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(["True", "False"]);
  const [users, setUsers] = useState([]);
  const [recordingsToBe, setRecordingsToBe] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);

  const [selectedRecording, setSelectedRecording] = useState(null);
  const [audioSrc, setAudioSrc] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

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
          setLoading(false);
        } else {
          throw new Error("Failed to fetch recordings");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleFilterChange = (filterName, selectedOptions) => {
    if (filterName === "Transcribed") {
      setSelectedStatus(selectedOptions);
    } else if (filterName === "User") {
      setSelectedUser(selectedOptions);
    }
  };

  const handleResetFilters = () => {
    setSelectedStatus([]);
    setSelectedUser([]);
  };

  const statusTranslation = {
    true: "True",
    false: "False",
  };

  const filteredRecordings = recordings.filter((recording) => {
    const statusFilter =
      selectedStatus.length === 0 ||
      selectedStatus.includes(statusTranslation[recording.status]);
    const userFilter =
      selectedUser.length === 0 || selectedUser.includes(recording.user);
    return statusFilter && userFilter;
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const descendingComparator = (a, b) => {
    if (b < a) return -1;
    if (b > a) return 1;
    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a[orderBy], b[orderBy])
      : (a, b) => -descendingComparator(a[orderBy], b[orderBy]);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const sortedRecordings = stableSort(
    filteredRecordings,
    getComparator(order, orderBy)
  );

  const displayedAnamneses = sortedRecordings.slice(
    pagesVisited,
    pagesVisited + itemsPerPage
  );

  useEffect(() => {
    function getData() {
      if (selectedRecording) {
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recordings/${selectedRecording.id}/audio`,
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
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
          });
      }
    }

    getData();

    const interval = setInterval(getData, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
  }, [selectedRecording]);

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
              {audioSrc && <ReactAudioPlayer src={audioSrc} controls />}
              <div className={Style.tag}>
                <span class="material-symbols-outlined">audio_file</span>
                {recordingsToBe} recordings ready to be transcribed
              </div>
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
          {recordings.length > 0 && (
            <div>
              <div className={Style.filterContainer}>
                <div className={Style.filterIcon}>
                  <span class="material-symbols-outlined">filter_list</span>
                </div>

                <div className={Style.filters}>
                  <div className={Style.filterList}>
                    <FilterItem
                      filterName={"Transcribed"}
                      filterOptions={status}
                      selectedOptions={selectedStatus}
                      onChange={(selectedOptions) =>
                        handleFilterChange("Transcribed", selectedOptions)
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
                  {(selectedUser.length > 0 || selectedStatus.length > 0) && (
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
              <TableContainer>
                <Table aria-labelledby="recordings" size="medium">
                  <RTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {displayedAnamneses.map((recording) => (
                      <StyledTableRow
                        key={recording.id}
                        style={
                          recording.id == selectedRecording?.id
                            ? {
                                background: "#F3F8FF",
                                border: "2px solid #3B769D",
                                cursor: "pointer",
                              }
                            : { cursor: "pointer" }
                        }
                        onClick={() => {
                          if (recording.id == selectedRecording?.id) {
                            setSelectedRecording(null);
                            setAudioSrc(null);
                          } else {
                            setSelectedRecording(recording);
                          }
                        }}
                      >
                        <StyledTableCell>
                          {recording.anamnese_id}
                        </StyledTableCell>
                        <StyledTableCell className={Style.anamneseText}>
                          {recording.anamnese}
                        </StyledTableCell>
                        <StyledTableCell>{recording.user}</StyledTableCell>
                        <StyledTableCell>
                          {formatDate(recording.recorded_at)}
                        </StyledTableCell>
                        <StyledTableCell>
                          <div
                            className={`${Style.status} ${
                              recording.status ? Style.done : Style.undone
                            }`}
                          >
                            <span class="material-symbols-outlined">
                              {recording.status ? "check_circle" : "cancel"}
                            </span>
                            {recording.status
                              ? "Transcribed"
                              : "Not Transcribed"}
                          </div>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className={Style.paginationContainer}>
                <div className={Style.details}>
                  Anamneses {pagesVisited} a{" "}
                  {filteredRecordings.length > 10
                    ? pagesVisited + 10 > filteredRecordings.length
                      ? filteredRecordings.length
                      : pagesVisited + 10
                    : filteredRecordings.length}{" "}
                  de {filteredRecordings.length}
                </div>
                <ReactPaginate
                  previousLabel={
                    <span class="material-symbols-outlined">
                      arrow_back_ios_new
                    </span>
                  }
                  nextLabel={
                    <span class="material-symbols-outlined">
                      arrow_forward_ios
                    </span>
                  }
                  pageCount={Math.ceil(
                    filteredRecordings.length / itemsPerPage
                  )}
                  onPageChange={handlePageChange}
                  containerClassName={Style.pagination}
                  previousLinkClassName={Style.paginationLink}
                  nextLinkClassName={Style.paginationLink}
                  disabledClassName={Style.paginationDisabled}
                  activeClassName={Style.paginationActive}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Recordings;
