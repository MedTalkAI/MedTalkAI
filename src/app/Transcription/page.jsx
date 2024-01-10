import Navbar from "@/components/Navbar";
import Style from "./Transcription.module.css";
import TranscriptionResult from "@/components/TranscriptionResult";
import Metrics from "@/components/Metrics";
import data from "../../data/db.json";
import ModelStatistics from "@/components/ModelStatistics";
import HistoryTranscription from "@/components/HistoryTranscription";

// Mock datas
const modelMetric = data.models[0];
const transcriptions = data.trancriptions;

const Transcription = () => {
  return (
    <div className={Style.transcription}>
      <header>
        <Navbar />
      </header>
      <div className={Style.content}>
        <main>
          <h1 className={Style.title}>Analysis</h1>
          <div className={Style.controls}>
            <h2>Controls</h2>
            
          </div>
          <div className={Style.results}>
            <TranscriptionResult
              text={
                "O pacient relta uma séri de sintomas que tm impactad signitivamnt em sua qualidade de vid. Entre eles, dstaca-se a persistnt fadga, acompnhada por dores musculares e articulres frequentes."
              }
              isEditable={false}
            />
            <TranscriptionResult
              text={
                "O pacient relta uma séri de sintomas que tm impactad signitivamnt em sua qualidade de vid. Entre eles, dstaca-se a persistnt fadga, acompnhada por dores musculares e articulres frequentes."
              }
              isEditable={true}
            />
          </div>
          <div className={Style.metrics}>
            <Metrics wer={"0.3"} bleu={"0.85"} cosine={"0.9"} kappa={"0"} />
          </div>
          <div className={Style.model}>
            <ModelStatistics
              model={modelMetric.name}
              wers={modelMetric.wer}
              bleus={modelMetric.bleu}
              cosines={modelMetric.cosine}
            />
          </div>
        </main>
        <aside>
          <h1 className={Style.title}>History</h1>
          <div className={Style.historyTranscriptions}>
            {transcriptions.map((transcription) => (
              <HistoryTranscription
                transcription={transcription.model_transcription}
                date={transcription.date}
                bleu={transcription.bleu}
                cosine={transcription.cosine}
                kappa={transcription.kappa}
                model={transcription.model}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Transcription;
