import Navbar from "@/components/Navbar";
import Style from "./Transcription.module.css";

const Transcription = () => {
  return (
    <div className={Style.transcription}>
      <header>
        <Navbar />
      </header>
      <div className={Style.content}>
        <main>
          <h1>Analysis</h1>
          <div className={Style.controls}>
            <h2>Controls</h2>
          </div>
          <div className={Style.results}>
            <h2>Results</h2>
          </div>
          <div className={Style.metrics}>
            <h2>Metrics</h2>
          </div>
          <div className={Style.model}>
            <h2>Model Statistics</h2>
          </div>
        </main>
        <aside>
          <h1>History</h1>
        </aside>
      </div>
    </div>
  );
};

export default Transcription;
