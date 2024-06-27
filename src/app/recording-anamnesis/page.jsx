"use client";

import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Styles from "./RecordingAnamnesis.module.css";
import AudioRecorderComponent from "@/components/AudioRecorderComponent/index.jsx";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import TranscriptionResult from "@/components/TranscriptionResult";
import ReactPaginate from "react-paginate";
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
            className={Styles.tableHeading}
          >
            {["id", "words"].includes(headCell.id) ? (
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

const RecordingAnamnesis = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");
  const [selectedAnamnese, setSelectedAnamnese] = useState();
  const [loading, setLoading] = useState(true);
  const [transcription, setTranscription] = useState();
  const [model, setModel] = useState();
  const [transcriptionId, setTranscriptionId] = useState();
  const [anamneses, setAnamneses] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isEditAnamnese, setIsEditAnamnese] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonAux, setIsButtonAux] = useState(-1);
  const [isEdit, setIsEdit] = useState(null);

  const [pageNumber, setPageNumber] = useState(0);
  const itemsPerPage = 10;
  const pagesVisited = pageNumber * itemsPerPage;

  useEffect(() => {
    setSelectedAnamnese(null);

    const fetchData = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/anamneses?recorded=false`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${
              typeof window !== "undefined" && window.localStorage
                ? localStorage.getItem("access_token")
                : ""
            }`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const processedData = data.map((anamnese) => ({
            ...anamnese,
            words: anamnese.text.split(/\s+/).length,
          }));
          setAnamneses(processedData.sort((a, b) => a.id - b.id));
          setLoading(false);
        } else {
          setLoading(false);
          throw new Error("Failed to fetch anamneses");
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 120000); // 120000 milissegundos = 2 minutos
    return () => clearInterval(interval);
  }, []);

  const handleUpdated = (editableText) => {
    const aux_anamneses = JSON.parse(JSON.stringify(anamneses));
    const updatedAnamneses = aux_anamneses.map((anamnese) => {
      if (anamnese.id === selectedAnamnese.id) {
        anamnese.text = editableText;
      }
      return anamnese;
    });
    setAnamneses(updatedAnamneses);
    setIsModalOpen(false);
    setSelectedAnamnese(null);
    setIsEdit(false);
    setIsButtonAux(false);
    toast.success("Anamnesis updated successfully!");
  };

  const handleTranscribe = (anamneseRecorded) => {
    setAnamneses(
      anamneses.filter(
        (anamnese) => anamnese.id !== anamneseRecorded.anamnese_id
      )
    );
    toast.success("Anamnesis recorded successfully!");
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (orderBy === 'words') {
      return b[orderBy] - a[orderBy];
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

  const sortedRecordings = stableSort(anamneses, getComparator(order, orderBy));

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

  const anamnesisRecord = () => {
    if (selectedAnamnese === null) {
      return (
        <div className={Styles.infoIcon}>
          <span className="material-symbols-outlined">info</span>
          <p className={Styles.infoMessage}>
            Select any anamnese and record it
          </p>
        </div>
      );
    } else {
      return (
        <AudioRecorderComponent
          path="/recording-anamnesis"
          onTrascribe={handleTranscribe}
          onIsRecorded={setIsRecorded}
          anamnese_id={selectedAnamnese?.id}
        />
      );
    }
  };

  const handleAnamneseClick = (anamnese) => {
    if (isModalOpen && anamnese.id != isButtonAux) {
      setIsModalOpen(false);
    }
    setSelectedAnamnese(anamnese);
  };

  const handlePageChange = ({ selected }) => {
    setPageNumber(selected);
  };

  const handleEditButtonClick = (anamnese) => {
    setIsButtonAux(anamnese.id);
    setIsModalOpen(true);
    setIsEdit(anamnese.id);
  };

  const displayedAnamneses = sortedRecordings.slice(
    pagesVisited,
    pagesVisited + itemsPerPage
  );

  return (
    <div className={Styles.container}>
      <CheckAuthExpiration />
      <div className={!isModalOpen && isFixed ? Styles.fixedNavbar : ""}>
        <Navbar path="/recording-anamnesis" />
      </div>
      <ToastContainer />
      <div className={Styles.containerAnamnese}>
        <h1 className={Styles.title}>Recording Anamnesis</h1>
        <div className={!isModalOpen && isFixed ? Styles.fixedContent : ""}>
          <p className={Styles.subTitle}>Record Selected Anamnesis</p>
          <div>{anamnesisRecord()}</div>
        </div>
        <div className={Styles.anamnesisGroup}>
          {anamneses && (
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
                        selectedAnamnese?.id === anamnese.id
                          ? Styles.selected
                          : ""
                      }`}
                      key={anamnese.id}
                      onClick={() => handleAnamneseClick(anamnese)}
                      style={
                        selectedAnamnese?.id === anamnese.id
                          ? { backgroundColor: "#f1f2f7" }
                          : { backgroundColor: "#ffffff" }
                      }
                    >
                      <StyledTableCell>{anamnese.id}</StyledTableCell>
                      {selectedAnamnese?.id === anamnese.id &&
                      isEdit === anamnese.id ? (
                        <StyledTableCell>
                          <TranscriptionResult
                            className={Styles.editable}
                            text={selectedAnamnese?.text}
                            isEditable={true}
                            onSave={handleUpdated}
                            transcription_id={selectedAnamnese?.id}
                          />
                        </StyledTableCell>
                      ) : (
                        <>
                          {selectedAnamnese?.id === anamnese.id ? (
                            <StyledTableCell>
                              <TranscriptionResult
                                className={Styles.nonEditable}
                                text={anamnese?.text}
                                isEditable={false}
                              />
                              {selectedAnamnese?.id === anamnese.id && (
                                <div
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <button
                                    className={Styles.button}
                                    onClick={() =>
                                      handleEditButtonClick(anamnese)
                                    }
                                  >
                                    <span className="material-symbols-outlined">
                                      edit
                                    </span>
                                    <span className={Styles.textSpanButton}>
                                      Edit Anamnesis
                                    </span>
                                  </button>
                                </div>
                              )}
                            </StyledTableCell>
                          ) : (
                            <>
                              <StyledTableCell>
                                <span>{anamnese.text}</span>
                              </StyledTableCell>
                            </>
                          )}
                        </>
                      )}
                      <StyledTableCell className={`${Styles.anamneseWorks}`}>
                        {anamnese.words}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
        <div className={Styles.paginationContainer}>
          <div className={Styles.details}>
            Anamneses {pagesVisited} a{" "}
            {anamneses.length > 10
              ? pagesVisited + 10 > anamneses.length
                ? anamneses.length
                : pagesVisited + 10
              : anamneses.length}{" "}
            de {anamneses.length}
          </div>
          <ReactPaginate
            previousLabel={
              <span className="material-symbols-outlined">
                arrow_back_ios_new
              </span>
            }
            nextLabel={
              <span className="material-symbols-outlined">
                arrow_forward_ios
              </span>
            }
            pageCount={Math.ceil(anamneses.length / itemsPerPage)}
            onPageChange={handlePageChange}
            containerClassName={Styles.pagination}
            previousLinkClassName={Styles.paginationLink}
            nextLinkClassName={Styles.paginationLink}
            disabledClassName={Styles.paginationDisabled}
            activeClassName={Styles.paginationActive}
          />
        </div>
      </div>
    </div>
  );
};

export default RecordingAnamnesis;
