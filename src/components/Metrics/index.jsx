import Style from "./Metrics.module.css";

const Metrics = ({ transcription, wer, bleu, cosine }) => {
  return (
    <div className={Style.container}>
      <h2 className={Style.title}>Metrics</h2>
      {transcription && wer != null && (
        <div className={Style.metrics}>
          <div>
            <b>WER</b> {wer.toFixed(2)}
          </div>
          <div>
            <b>Cosine</b> {cosine.toFixed(2)}
          </div>
          <div>
            <b>BLEU</b> {bleu.toFixed(2)}
          </div>
        </div>
      )}
      {!transcription && <p>No transcription performed</p>}
      {transcription && wer == null && (
        <p>Save the transcription to get the metrics</p>
      )}
    </div>
  );
};

export default Metrics;
