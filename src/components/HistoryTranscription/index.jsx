const HistoryTranscription = ({ transcription, model, metrics, date }) => {
  return (
    <div className="history">
      <p className="transciption">{transcription}</p>
      <span className="model">Modelo: {model}</span>
      <ul className="metrics"></ul>
      <span className="date"></span>
    </div>
  );
};

export default HistoryTranscription;
