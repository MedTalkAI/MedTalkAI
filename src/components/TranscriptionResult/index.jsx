"use client";

import Style from "./TranscriptionResult.module.css";
import { useState, useEffect } from "react";

const TranscriptionResult = ({ text, isEditable }) => {
  const [editableText, setEditableText] = useState(text);

  const handleTextChange = (e) => {
    setEditableText(e.target.value);
  };

  useEffect(() => {
    setEditableText(text);
  }, [text]);
  return (
    <div className={Style.transcriptionResult}>
      {/**
         @todo: alinhar verticamente o texto quando ele for vazio
      **/}
      <h1 className={Style.title}>
        {isEditable ? "Corrected" : "Model"} Transcription
      </h1>
      <textarea
        className={`${Style.textArea} ${
          text
            ? isEditable
              ? Style.textAreaEditable
              : Style.textAreaFixed
            : ""
        }`}
        name=""
        value={editableText || "No transcription performed"}
        onChange={handleTextChange}
        readOnly={!isEditable || editableText === null}
        cols="32"
        rows="10"
        style={{ resize: text ? "vertical" : "none" }}
      />
      <div
        style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        {isEditable && text && (
          <button className={Style.btnSaveEdits}>Save Corrections</button>
        )}
      </div>
    </div>
  );
};

export default TranscriptionResult;
