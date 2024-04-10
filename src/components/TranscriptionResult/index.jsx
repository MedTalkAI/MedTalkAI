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
  const [isDataSicentist, setIsDataSicentist] = useState(false);

  const handleTextChange = (e) => {
    setEditableText(e.target.value);
  };

  const handleSaveEdits = async () => {
    console.log("save edits");
    try {
      let model_transcription = text;
      let correct_transcription = editableText;

      const formData = new FormData();
      formData.append("text", correct_transcription);

      // Submit FormData via fetch
      const token =
        typeof window !== "undefined" && window.localStorage
          ? localStorage.getItem("access_token")
          : null;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/anamneses/${transcription_id}`,
        {
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      console.log(result);

      onSave(correct_transcription);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    setEditableText(text);
  }, [text]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const type = JSON.parse(localStorage.getItem("user")).type;
      setIsDataSicentist(type == 1);
    }
  }, []);

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
        readOnly={isDataSicentist || (isEditable && editableText === null)}
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
        {isDataSicentist == false && isEditable && text && (
          <button className={Style.btnSaveEdits} onClick={handleSaveEdits}>
            Save Corrections
          </button>
        )}
      </div>
    </div>
  );
};

export default TranscriptionResult;
