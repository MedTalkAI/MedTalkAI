import Style from "./Metrics.module.css";

const Metrics = ({ transcription, wer, bleu, cosine, kappa }) => {
  return (
    <div className={Style.metrics}>
      <h1 className={Style.title}>Evaluation Metrics</h1>
      {transcription && wer!= null && (
        <ul className={Style.list}>
          <li><b>WER:</b> {wer.toFixed(2)}</li>
          <li><b>BLEU:</b> {bleu.toFixed(2)}</li>
          <li><b>Cosine Similarity:</b> {cosine.toFixed(2)}</li>
          <li><b>KAPPA:</b> {kappa}</li>
        </ul>
      )}
      {!transcription && (
        <p>No transcription performed</p>
      )}
      {transcription && wer==null && (
        <p>Save the transcription to get the metrics</p>
      )}
    </div>
  );
};

export default Metrics;
