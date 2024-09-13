import React, { useState } from 'react';

const noteColors = {
  "A": "#F5B7B1", // Pastel Orange
  "A♯": "#F5CBA7", // Pastel Darker Orange
  "B": "#FAD7A0", // Pastel Red-Orange
  "C": "#F8C471", // Pastel Red
  "C♯": "#F7A8A0", // Pastel Crimson
  "D": "#F6B8C0", // Pastel Firebrick
  "D♯": "#F4AAB9", // Pastel Dark Red
  "E": "#F3C6C9", // Pastel Maroon
  "F": "#F7B7A3", // Pastel Tomato
  "F♯": "#F6BEAE", // Pastel Coral
  "G": "#F5B9B7", // Pastel Orange-Red
  "G♯": "#F5B7A2" // Pastel Dark Orange
};

const Notes = ({ cx, cy, r, note, onNoteClick, onNoteRelease, selectedNote }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseDown = () => {
    setIsClicked(true);
    if (onNoteClick) {
      onNoteClick(note, cy); // Pass the y-coordinate
    }
  };

  const handleMouseUp = () => {
    setIsClicked(false);
    if (onNoteRelease) {
      onNoteRelease();
    }
  };

  const isSelected = note === selectedNote;
  const fillColor = isSelected ? noteColors[note] : 'white';

  return (
    <g
      className="note-circle group"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className={`stroke-gray-400 group-hover:stroke-gray-600 ${isClicked ? 'fill-red-500' : ''}`}
        fill={fillColor}
      />
      <text
        x={cx}
        y={cy}
        className="fill-gray-400 text-[14px] group-hover:fill-gray-600"
        style={{
          textAnchor: 'middle',
          dominantBaseline: 'central',
        }}
      >
        {note}
      </text>
    </g>
  );
};

export default Notes;
