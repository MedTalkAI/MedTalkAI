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
        <ModelStatistics model="Wav2Vec2 + lm5" />
        <ModelStatistics model="Wav2Vec2" />
        <ModelStatistics model="Whisper" />
        <ModelStatistics model="HuBert" />
      </div>
    </main>
  );
}
