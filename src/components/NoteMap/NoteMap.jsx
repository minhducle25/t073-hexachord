import React, { useEffect } from 'react';

// Static object to store categorized positions
const categorizedPositions = {
  'A': [],
  'A♯': [],
  'B': [],
  'C': [],
  'C♯': [],
  'D': [],
  'D♯': [],
  'E': [],
  'F': [],
  'F♯': [],
  'G': [],
  'G♯': []
};

const NoteMap = ({ note, x, y }) => {
  useEffect(() => {
    const newNotePosition = { note, x, y };

    if (categorizedPositions[note]) {
      categorizedPositions[note].push(newNotePosition);
    }
  }, [note, x, y]);

  return null; // This component does not render anything
};

export { categorizedPositions };
export default NoteMap;