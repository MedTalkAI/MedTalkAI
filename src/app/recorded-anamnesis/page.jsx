"use client";

import Navbar from "@/components/Navbar";
import { styled } from "@mui/material/styles";
import Style from "./RecordedAnamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactLoading from "react-loading";
import ReactAudioPlayer from "react-audio-player";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableSortLabel,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import { useState, useEffect, useRef } from "react";
import TranscriptionResult from "@/components/TranscriptionResult";
import ReactPaginate from "react-paginate";
import CheckAuthExpiration from "@/hooks/CheckAuthExpiration";

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
  "&:hover": {
    cursor: "pointer",
    backgroundColor: "#f1f2f7",
  },
}));

const headCells = [
  { id: "id", label: "Nº Anamnesis" },
  { id: "anamnese", label: "Anamnesis" },
  { id: "words", label: "Nº Words" },
  { id: "date", label: "Recorded At" },
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
            {["id", "words", "date"].includes(headCell.id) ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const RecordedAnamnesis = () => {
  const [order, setOrder] = useState("desc");
  const [error, setError] = useState(null);
  const [orderBy, setOrderBy] = useState("date");
  const [transcriptions, setTranscriptions] = useState([]);
  const [isEdit, setIsEdit] = useState();
  const [isButtonAux, setIsButtonAux] = useState();
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFixed, setIsFixed] = useState(false);
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

  const handleUpdated = (corrected) => {
    const aux_anamneses = JSON.parse(JSON.stringify(transcriptions));
    const updatedAnamneses = aux_anamneses.map((anamnese) => {
      if (anamnese.anamnese_id === selectedTranscription.anamnese_id) {
        anamnese.anamnese = corrected;
      }
      return anamnese;
    });
    setTranscriptions(updatedAnamneses);
    setIsModalOpen(false);
    setSelectedTranscription(null);
    setIsEdit(false);
    setIsButtonAux(false);
    toast.success("Anamnesis updated successfully!");
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
          method: "PUT",
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

    function getData() {
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
              const processedData = transcriptions.map((anamnese) => ({
                ...anamnese,
                words: anamnese.anamnese.split(/\s+/).length,
              }));
              setTranscriptions(
                processedData.sort(
                  (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
                )
              );
              setLoading(false);
            } else {
              setLoading(false);
              setError("Failed to load transcriptions");
              throw new Error("Failed to fetch transcriptions");
            }
          } catch (error) {
            setLoading(false);
            setError("Failed to load transcriptions");
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
              const processedData = transcriptions.map((anamnese) => ({
                ...anamnese,
                words: anamnese.anamnese.split(/\s+/).length,
              }));
              setTranscriptions(
                processedData.sort(
                  (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
                )
              );
            } else {
              setError("Failed to load transcriptions");
              throw new Error("Failed to fetch transcriptions");
            }
          } catch (error) {
            setError("Failed to load transcriptions");
            console.error(error);
          }
        };

        fetchData();
      }
    }

    getData();

    const interval = setInterval(getData, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
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

  const handleAnamneseClick = (anamnese) => {
    if (isModalOpen && anamnese.id != isButtonAux) {
      setIsModalOpen(false);
    }
    setSelectedTranscription(anamnese);
  };

  const handleEditButtonClick = (anamnese) => {
    setIsButtonAux(anamnese.id);
    setIsModalOpen(true);
    setIsEdit(anamnese.id);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === "words") {
      return b[orderBy] - a[orderBy];
    } else if (orderBy === "date") {
      return new Date(b.recorded_at) - new Date(a.recorded_at);
    } else {
      if (b[orderBy] < a[orderBy]) return -1;
      if (b[orderBy] > a[orderBy]) return 1;
      return 0;
    }
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
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
    transcriptions,
    getComparator(order, orderBy)
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > 0) {
        if (!isModalOpen) {
          setIsFixed(true);
        }
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

  const displayedAnamneses = sortedRecordings.slice(
    pagesVisited,
    pagesVisited + itemsPerPage
  );

  return (
    <div>
      <Navbar path="/recorded-anamnesis" />
      <div className={Style.content}>
        <CheckAuthExpiration />
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
            </div>
          </div>
          {loading && (
            <div className={Style.loading}>
              <ReactLoading
                type="spinningBubbles"
                color="#001D3B"
                height={"100px"}
                width={"100px"}
              />
              <p>Loading...</p>
            </div>
          )}
          {!loading && transcriptions.length == 0 && (
            <div className={Style.error}>
              <p>
                No recordings found by you.
                <br />
                <br />
                Please record an anamnesis first.
              </p>
            </div>
          )}
          {!loading && error && (
            <div className={Style.error}>
              <p>{error}</p>
            </div>
          )}
          {!loading && transcriptions.length != 0 && (
            <>
              <div className={Style.anamnesisGroup}>
                {transcriptions && (
                  <TableContainer component={Paper}>
                    <Table>
                      <RTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody>
                        {displayedAnamneses.map((anamnese, index) => (
                          <StyledTableRow
                            className={`${
                              selectedTranscription?.id === anamnese.id
                                ? Style.selected
                                : ""
                            }`}
                            key={anamnese.id}
                            onClick={() => handleAnamneseClick(anamnese)}
                            style={
                              selectedTranscription?.id === anamnese.id
                                ? { backgroundColor: "#f1f2f7" }
                                : {}
                            }
                          >
                            <StyledTableCell>
                              {anamnese.anamnese_id}
                            </StyledTableCell>
                            {selectedTranscription?.id === anamnese.id &&
                            isEdit === anamnese.id ? (
                              <StyledTableCell
                                style={{ paddingInline: "10px" }}
                              >
                                <TranscriptionResult
                                  className={Style.editable}
                                  text={selectedTranscription?.anamnese}
                                  isEditable={true}
                                  onSave={handleUpdated}
                                  transcription_id={
                                    selectedTranscription?.anamnese_id
                                  }
                                />
                              </StyledTableCell>
                            ) : (
                              <>
                                {selectedTranscription?.id === anamnese.id ? (
                                  <StyledTableCell>
                                    <TranscriptionResult
                                      className={Style.nonEditable}
                                      text={selectedTranscription?.anamnese}
                                      isEditable={false}
                                    />
                                    {selectedTranscription?.id ===
                                      anamnese.id && (
                                      <div
                                        style={{
                                          width: "100%",
                                          display: "flex",
                                          justifyContent: "flex-end",
                                        }}
                                      >
                                        <button
                                          className={Style.button}
                                          onClick={() =>
                                            handleEditButtonClick(anamnese)
                                          }
                                        >
                                          <span className="material-symbols-outlined">
                                            edit
                                          </span>
                                          <span
                                            className={Style.textSpanButton}
                                          >
                                            Edit Anamnesis
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </StyledTableCell>
                                ) : (
                                  <>
                                    <StyledTableCell>
                                      <span className={Style.anamneseTextSpan}>
                                        {anamnese.anamnese}
                                      </span>
                                    </StyledTableCell>
                                  </>
                                )}
                              </>
                            )}
                            <StyledTableCell>{anamnese.words}</StyledTableCell>
                            <StyledTableCell>
                              {new Date(
                                anamnese.recorded_at
                              ).toLocaleDateString()}
                            </StyledTableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </div>
              <div className={Style.paginationContainer}>
                <div className={Style.details}>
                  Anamneses {pagesVisited} a{" "}
                  {transcriptions.length > 10
                    ? pagesVisited + 10 > transcriptions.length
                      ? transcriptions.length
                      : pagesVisited + 10
                    : transcriptions.length}{" "}
                  de {transcriptions.length}
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
                  pageCount={Math.ceil(transcriptions.length / itemsPerPage)}
                  onPageChange={handlePageChange}
                  containerClassName={Style.pagination}
                  previousLinkClassName={Style.paginationLink}
                  nextLinkClassName={Style.paginationLink}
                  disabledClassName={Style.paginationDisabled}
                  activeClassName={Style.paginationActive}
                />
              </div>
            </>
          )}
        </main>
      </div>
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
