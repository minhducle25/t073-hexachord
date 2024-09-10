import React, { useState } from 'react';

const noteColors = {
  "A": "#FFA500", // Orange
  "A♯": "#FF8C00", // Darker Orange
  "B": "#FF4500", // Red-Orange
  "C": "#FF0000", // Red
  "C♯": "#DC143C", // Crimson
  "D": "#B22222", // Firebrick
  "D♯": "#8B0000", // Dark Red
  "E": "#800000", // Maroon
  "F": "#FF6347", // Tomato
  "F♯": "#FF7F50", // Coral
  "G": "#FF4500", // Orange-Red
  "G♯": "#FF8C00" // Dark Orange
};

const Notes = ({ cx, cy, r, note, onNoteClick, onNoteRelease, selectedNote }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleMouseDown = () => {
    console.log(note);
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
        className="fill-gray-400 text-[12px] group-hover:fill-gray-600"
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