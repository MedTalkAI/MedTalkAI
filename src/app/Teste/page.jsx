import Metrics from "@/components/Metrics";
import data from "../../data/db.json";
import ModelStatistics from "@/components/ModelStatistics";

const Teste = () => {
  const metrics = data.models[1];
  return (
    <ModelStatistics
      model={metrics.name}
      wers={metrics.wer}
      bleus={metrics.bleu}
      cosines={metrics.cosine}
    />
  );
};

export default Teste;
