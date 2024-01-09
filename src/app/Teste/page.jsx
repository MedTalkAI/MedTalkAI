import HistoryTranscription from "@/components/HistoryTranscription";
import data from "../../data/db.json";

const Teste = () => {
  console.log(data.trancriptions);
  return data.trancriptions.map((transcription) => (
    <HistoryTranscription
      transcription={transcription.model_transcription}
      model={"Wav2Vec"}
      date={"11/12/23"}
      bleu={transcription.bleu}
      cosine={transcription.cosine}
      wer={transcription.wer}
      kappa={transcription.kappa}
    />
  ));
};

export default Teste;
