"use client";

import Style from "./TranscriptionResult.module.css";
import { useState } from "react";

const TranscriptionResult = ({ text, isEditable }) => {
  const [editableText, setEditableText] = useState(text);

  const handleTextChange = (e) => {
    setEditableText(e.target.value);
  };

  return (
    <div className={Style.transcriptionResult}>
      <h1 className={Style.title}>
        {isEditable ? "Corrected Transcript" : "Model Transcript"}
      </h1>
      <textarea
        className={`${Style.textArea} ${
          isEditable ? Style.textAreaEditable : Style.textAreaFixed
        }`}
        name=""
        value={editableText}
        onChange={handleTextChange}
        readOnly={!isEditable}
        cols="30"
        rows="10"
      ></textarea>
      <div
        style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        {isEditable && (
          <button className={Style.btnSaveEdits}>Save Corrections</button>
        )}
      </div>
    </div>
  );
};

export default TranscriptionResult;
