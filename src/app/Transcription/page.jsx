import TranscriptionResult from "@/components/TranscriptionResult";

const Transcription = () => {
  return (
    <div>
      <h1>Trasncription</h1>
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
  );
};

export default Transcription;
