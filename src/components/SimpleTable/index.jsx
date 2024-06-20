import React from "react";
import { styled } from "@mui/material/styles";
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
import Style from "./SimpleTable.module.css";

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
  { id: "transcription", label: "Transcription" },
  { id: "model", label: "Model" },
];

function ATableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <StyledTableCell key={headCell.id} className={Style.tableHeading}>
            {headCell.label}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const SimpleTable = ({ data, current }) => {

  const navigateToAnamnese = (anamneseId) => {
    window.location.href = `/anamnese/${anamneseId}`;
  };

  return (
    <div className={Style.table}>
      <h3>Transcriptions from other models</h3>
      {data.length <= 1 && (
        <div className={Style.error}>
          <p>No transcriptions from other models</p>
        </div>
      )}
      {data.length > 1 && (
        <TableContainer>
          <Table>
            <ATableHead />
            <TableBody>
              {data
                .filter((row) => String(row.id) !== String(current))
                .map((row) => (
                  <StyledTableRow key={row.id} onClick={() => navigateToAnamnese(row.id)}>
                    <StyledTableCell>{row.transcription}</StyledTableCell>
                    <StyledTableCell style={{ whiteSpace: "nowrap" }}>{row.model}</StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};
export default SimpleTable;
