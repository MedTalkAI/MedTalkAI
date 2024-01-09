import Style from "./Metrics.module.css"

const Metrics = ({ wer, bleu, cosine, kappa }) => {
  return (
    <div className={Style.metrics}>
      <h1 className={Style.title}>Metrics</h1>
      <ul className={Style.list}>
        <li>WER: {wer}</li>
        <li>BLEU: {bleu}</li>
        <li>Cosine Similarity: {cosine}</li>
        <li>KAPPA: {kappa}</li>
      </ul>
    </div>
  );
};

export default Metrics;
