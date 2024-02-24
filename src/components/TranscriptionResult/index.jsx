"use client";

import Style from "./TranscriptionResult.module.css";
import { useState, useEffect } from "react";

const TranscriptionResult = ({
  text,
  isEditable,
  onSave,
  transcription_id,
}) => {
  const [editableText, setEditableText] = useState(text);

  const handleTextChange = (e) => {
    setEditableText(e.target.value);
  };

  const handleSaveEdits = async () => {
    console.log("save edits");
    try {
      let model_transcription = text;
      let correct_transcription = editableText;

      const formData = new FormData();
      formData.append("correction", correct_transcription);

      // Submit FormData via fetch
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `http://localhost:5000/corrections/${transcription_id}`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);

      onSave(correct_transcription, result);
    } catch (error) {
      console.error("Error:", error);
    }
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
        style={{
          resize: text ? "vertical" : "none",
          textAlign: !editableText ? "center" : "left",
          display: !editableText ? "flex" : "block",
          justifyContent: !editableText ? "center" : "normal",
          alignItems: !editableText ? "center" : "normal",
          position: "relative",
        }}
      />
      <div
        style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}
      >
        {isEditable && text && (
          <button className={Style.btnSaveEdits} onClick={handleSaveEdits}>
            Save Corrections
          </button>
        )}
      </div>
    </div>
  );
};

export default TranscriptionResult;
