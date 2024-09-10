// noteUtils.js
const notes = ["A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"];

const getStartingNote = (lineIndex) => {
  const interval = 5; // Interval to move to the next starting note
  if ((lineIndex + 1) % 2 === 0) {
    // Even lines (lineIndex 1, 3, 5, ...)
    return notes[(9 + Math.floor(lineIndex / 2) * interval) % notes.length];
  } else {
    // Odd lines (lineIndex 0, 2, 4, ...)
    return notes[(Math.floor(lineIndex / 2) * interval) % notes.length];
  }
};

export { getStartingNote, notes };