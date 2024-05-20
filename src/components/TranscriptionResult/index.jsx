"use client";

import Style from "./TranscriptionResult.module.css";
import { useState, useEffect } from "react";
import Modal from "react-modal";
const TranscriptionResult = ({
  text,
  isEditable,
  onSave,
  transcription_id,
  title
}) => {
  
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function contarQuebrasDeLinha(texto) {
    
    let contador = 0;
    for (let i = 0; i < texto.length; i++) {
        if (texto[i] === '\n') {
            contador++;
        }
    }
    if(contador < 5 && texto != null){
      contador = 7;
    }
    return contador;
}
const numLinhas = contarQuebrasDeLinha(text) + 1;
  return (
    <div className={Style.transcriptionResult}>
      {/**
         @todo: alinhar verticamente o texto quando ele for vazio
      
      <h1 className={Style.title}>
        {title ? title : (isEditable ? "Corrected Transcription" : "Model Transcription")}
      </h1>**/}
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
        readOnly={isDataSicentist || !(isEditable || editableText === null)}
        cols="32"
        rows={numLinhas}
        style={{
          height: "auto",
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
          <button className={Style.btnSaveEdits}  onClick={() => {
            setIsModalOpen(true);
          }}>
            Save Corrections
          </button>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCancel}
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
            width: "400px",
            height: "200px",
            margin: "auto",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#fff",
          },
        }}
      >
        <>
          <h2>Save Corrections</h2>
          <p>Are you sure you want to save corrections?</p>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className={Style.buttonOk} onClick={handleSaveEdits}>
              Yes
            </button>
            <button className={Style.buttonCancel} onClick={handleCancel}>
              No
            </button>
          </div>
        </>
      </Modal>
    </div>
  );
};

export default TranscriptionResult;
