import ModelStatistics from "@/components/ModelStatistics";
import Navbar from "@/components/Navbar";
import React from "react";
import Style from "./Statistics.module.css";

export default function Statistcs() {
  return (
    <main>
      <header>
        <Navbar />
      </header>
      <div className={Style.content}>
        <ModelStatistics model="Wav2Vec 2.0 + lm5" />
        <ModelStatistics model="Wav2Vec 2.0" />
        <ModelStatistics model="Whisper" />
        <ModelStatistics model="HuBert" />
      </div>
    </main>
  );
}
