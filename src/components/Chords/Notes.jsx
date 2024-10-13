import React, { useState } from "react";

export const noteColors = {
  A: "#E57373", // Soft Red
  "A♯": "#FF8A65", // Soft Coral
  B: "#FFB74D", // Soft Orange
  C: "#FFD54F", // Soft Yellow
  "C♯": "#F06292", // Soft Pink
  D: "#BA68C8", // Soft Purple
  "D♯": "#9575CD", // Soft Lavender
  E: "#7986CB", // Soft Blue
  F: "#4FC3F7", // Soft Light Blue
  "F♯": "#4DD0E1", // Soft Cyan
  G: "#4DB6AC", // Soft Teal
  "G♯": "#81C784", // Soft Green
};

const Notes = ({
  cx,
  cy,
  r,
  note,
  onNoteClick,
  onNoteRelease,
  selectedNote,
  className = '',
}) => {
  const [isClicked, setIsClicked] = useState(false);
  
  // console.log(cx, cy, r, note, onNoteClick, onNoteRelease, selectedNote, className);
  
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
  const fillColor = isSelected ? noteColors[note] : "white";
  const fontSize = className.includes('re-rendered-note') ? '26px' : '12px';

  return (
    <g
      className={`note-circle group ${className}`} // Apply the className prop
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className={`stroke-gray-400 group-hover:stroke-red-600 ${
          isClicked ? "fill-red-500" : ""
        }`}
        fill={fillColor}
      />
      <text
        x={cx}
        y={cy}
        className="fill-slate-950"
        style={{
          textAnchor: "middle",
          dominantBaseline: "central",
          fontSize: fontSize,
        }}
      >
        {note}
      </text>
    </g>
  );
};

export default Notes;