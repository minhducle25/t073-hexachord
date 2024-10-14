import React from "react";

const ClearNotes = ({ setIsPlayingNotes, setTotalBeats, setRenderPianoRoll, isPlayingNotes }) => {
  const handleClearNotes = () => {
    setIsPlayingNotes([]);
    setTotalBeats(16);
    if (isPlayingNotes.length > 100) {
      setRenderPianoRoll(false);
      setTimeout(() => setRenderPianoRoll(true), 0);
    }
  };

  return (
    <button
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      onClick={handleClearNotes}
    >
      🗑️
    </button>
  );
};

export default ClearNotes;