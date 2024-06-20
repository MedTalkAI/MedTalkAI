"use client";

import Navbar from "@/components/Navbar";
import { styled } from "@mui/material/styles";
import FilterItem from "@/components/FilterItem";
import Style from "./Anamnesis.module.css";
import { ToastContainer, toast } from "react-toastify";
import ReactLoading from "react-loading";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  TableContainer,
  Button,
} from "@mui/material";
import { tableCellClasses } from "@mui/material/TableCell";
import ReactModal from "react-modal";
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
}));

const headCells = [
  { id: "id", label: "ID" },
  { id: "transcription", label: "Transcription" },
  { id: "model", label: "Model" },
  { id: "wer", label: "WER" },
  { id: "user", label: "User" },
  { id: "date", label: "Date" },
];

function ATableHead({ order, orderBy, onRequestSort }) {
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

const Anamnesis = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const [transcriptions, setTranscriptions] = useState([]);
  const [recordingsToBe, setRecordingsToBe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState(["Original", "Hapvida"]);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const [models, setModels] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [file, setFile] = useState(null);

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const navigateToAnamnese = (anamneseId) => {
    window.location.href = `/anamnese/${anamneseId}`;
  };

  const generateTranscriptions = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transcriptions/recordings`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        }
      );
      if (response.status == 202) {
        toast.success("Transcriptions are being generated!");
      } else if (response.status == 404) {
        toast.success("No recordings to be transcribed");
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
          setTranscriptions(transcriptions);
          setUsers(
            transcriptions
              .map((transcription) => transcription.user)
              .filter((user, index, self) => self.indexOf(user) === index)
          );
          setModels(
            transcriptions
              .map((transcription) => transcription.model)
              .filter((model, index, self) => self.indexOf(model) === index)
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

    const interval = setInterval(() => {
      fetchRecordings();
      fetchData();
    }, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {}, [file]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
      selectedModels.includes(transcription.model);
    const typeFilter =
      selectedTypes.length === 0 ||
      selectedTypes.includes(
        transcription.anamnese_id === null ? "Original" : "Hapvida"
      );
    const userFilter =
      selectedUsers.length === 0 || selectedUsers.includes(transcription.user);
    return modelFilter && typeFilter && userFilter;
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

  const sortedTranscriptions = stableSort(
    filteredTranscriptions,
    getComparator(order, orderBy)
  );

  const displayedAnamneses = sortedTranscriptions.slice(
    pagesVisited,
    pagesVisited + itemsPerPage
  );

  const uploadFile = () => {
    if (file) {
      const formData = new FormData();
      formData.append("anamneses", file);

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/anamneses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to upload file");
          }
          toast.success("Upload realizado com sucesso!");
          setFile(null);
          setUploadModalOpen(false);
        })
        .catch((error) => {
          console.error("Upload error:", error);
          toast.error("Upload error:", error);
        });
    }
  };

  function handleBenckmark() {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcriptions/benchmark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success(data.message);
      })
      .catch((error) => {
        toast.error("An error occurred.");
      });
  }

  return (
    <div>
      <Navbar path="/anamnesis" />
      <div className={Style.content}>
        <CheckAuthExpiration />
        <ToastContainer />
        <main>
          <div className={Style.head}>
            <h1 className={Style.title}>Transcriptions</h1>
            <div className={Style.options}>
              <button onClick={handleBenckmark} className={Style.benchmark}>
                <span class="material-symbols-outlined">bubble_chart</span>
                Benchmark
              </button>
              <button
                className={Style.upload}
                onClick={() => {
                  setUploadModalOpen(true);
                }}
              >
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
              <button
                className={Style.secondaryButton}
                onClick={generateTranscriptions}
              >
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
              <TableContainer>
                <Table aria-labelledby="anamnesis" size="medium">
                  <ATableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {displayedAnamneses.map((anamnese, i) => (
                      <StyledTableRow
                        key={anamnese.id}
                        onClick={() => navigateToAnamnese(anamnese.id)}
                      >
                        <StyledTableCell>{anamnese.id}</StyledTableCell>
                        <StyledTableCell className={Style.anamneseText}>
                          {anamnese.transcription}
                        </StyledTableCell>
                        <StyledTableCell>{anamnese.model}</StyledTableCell>
                        <StyledTableCell>{parseFloat(anamnese.wer).toFixed(2)}</StyledTableCell>
                        <StyledTableCell>{anamnese.user}</StyledTableCell>
                        <StyledTableCell>
                          {formatDate(anamnese.date)}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className={Style.paginationContainer}>
                <div className={Style.details}>
                  Anamneses {pagesVisited} a{" "}
                  {filteredTranscriptions.length > 10
                    ? pagesVisited + 10 > filteredTranscriptions.length
                      ? filteredTranscriptions.length
                      : pagesVisited + 10
                    : filteredTranscriptions.length}{" "}
                  de {filteredTranscriptions.length}
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
                    filteredTranscriptions.length / itemsPerPage
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
      <ReactModal
        isOpen={uploadModalOpen}
        onRequestClose={() => {
          setUploadModalOpen(false);
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
            width: "600px",
            height: "300px",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <h2>Upload a Anamnesis File</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <input
              accept=".csv"
              id="inputFile"
              type="file"
              style={{ display: "none" }}
              onChange={(event) => {
                setFile(event.target.files[0]);
              }}
            />
            <label htmlFor="inputFile">
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ fontSize: "100px", color: "#346C90" }}
                  class="material-symbols-outlined"
                >
                  upload_file
                </span>
              </div>
            </label>
            {file && <p>{file?.name}</p>}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: "10px",
              width: "100%",
            }}
          >
            <button className={Style.buttonOk} onClick={uploadFile}>
              Upload
            </button>
            <button
              className={Style.buttonCancel}
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </ReactModal>
    </div>
  );
};

export default Anamnesis;
