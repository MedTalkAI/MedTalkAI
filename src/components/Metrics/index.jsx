import Style from "./Metrics.module.css";

const Metrics = ({ transcription, wer, bleu, cosine, kappa }) => {
  return (
    <div className={Style.metrics}>
      <h1 className={Style.title}>Evaluation Metrics</h1>
      {transcription && (
        <ul className={Style.list}>
          <li><b>WER:</b> {wer}</li>
          <li><b>BLEU:</b> {bleu}</li>
          <li><b>Cosine Similarity:</b> {cosine}</li>
          <li><b>KAPPA:</b> {kappa}</li>
        </ul>
      )}
      {!transcription && (
        <p>No transcription performed</p>
      )}
    </div>
  );
};

export default Metrics;
