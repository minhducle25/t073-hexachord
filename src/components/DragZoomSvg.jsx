import React, { useState, useEffect, useRef, useContext } from "react";
import TonnetzSelector from "./TonnetzSelector";
import Notes, { noteColors } from "./Chords/Notes";
import Trichords from "./Chords/Trichords";
import BottomDrawer from "./BottomDrawer";
import ToneGenerator from "./ToneGenerator"; // Import ToneGenerator
import NoteMap from "./NoteMap";
import { getStartingNote, notes } from "./noteUtils"; // Import the utility function and notes array
import { PlayingContext } from "../context/PlayingContext";
import Connector from "./PianoRoll/Connector";

const notePositions = [];

const calculateNextNotePositions = (previousPositions, yOffset) => {
  return previousPositions.map(({ x, y }) => ({
    x: x,
    y: y + yOffset,
  }));
};

const DragZoomSvg = ({
  height,
  width,
  scaleBounds = { mini: 1, maxi: 2 },
  lock = false,
  graph,
  setGraph,
  children,
}) => {
  // State to handle transformations and interactions
  const { isPlaying, isPlayingNotes } = useContext(PlayingContext); // Use the context
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(2);
  const [captureMouse, setCaptureMouse] = useState(false);
  const [clickedPos, setClickedPos] = useState({ x: 0, y: 0 });
  const [selectedNote, setSelectedNote] = useState(null); // State to keep track of the selected note
  const [matchingPoints, setMatchingPoints] = useState([]); // State for matching points
  const [activeChord, setActiveChord] = useState(null); // State for active chord

  const svgRef = useRef(null);
  const toneGeneratorRef = useRef(null); // Ref for ToneGenerator

  const transform = `scale(${scale}) translate(${tx} ${ty})`;
  const viewbox = `0 0 ${width} ${height}`;
  const bounds = {
    xmin: -tx,
    ymin: -ty,
    xmax: -tx + width / scale,
    ymax: -ty + height / scale,
  };

  // Effect to handle lock changes
  useEffect(() => {
    if (lock) captureOff();
  }, [lock]);

  // useEffect(() => {
  //   if (isPlaying) {
  //     console.log("playing");
  //     console.log("Notes:", isPlayingNotes);
  //   } else {
  //     console.log("stopped");
  //   }
  // }, [isPlaying, isPlayingNotes]);

  // Functions to handle zoom, drag, and pan
  const zoomInOut = (wheelEvent) => {
    if (lock) return; // Ignore if locked

    let multiplier = Math.exp(-wheelEvent.deltaY / 600);
    multiplier = bound(
      multiplier,
      scaleBounds.mini / scale,
      scaleBounds.maxi / scale
    );

    if (multiplier === 1) return; // Don't bother with the rest if nothing changes

    const pointer = {
      x: wheelEvent.clientX - svgRef.current.getBoundingClientRect().left,
      y: wheelEvent.clientY - svgRef.current.getBoundingClientRect().top,
    };

    const pointerSvg = {
      x: pointer.x / scale - tx,
      y: pointer.y / scale - ty,
    };

    setTx((prevTx) => (prevTx + pointerSvg.x) / multiplier - pointerSvg.x);
    setTy((prevTy) => (prevTy + pointerSvg.y) / multiplier - pointerSvg.y);
    setScale((prevScale) => prevScale * multiplier);
  };

  const drag = (event) => {
    if (captureMouse) {
      const dx = event.clientX - clickedPos.x;
      const dy = event.clientY - clickedPos.y;
      setTx((prevTx) => prevTx + dx / scale);
      setTy((prevTy) => prevTy + dy / scale);
      setClickedPos({ x: event.clientX, y: event.clientY });
    }
  };

  const captureOn = (event) => {
    if (lock) return; // Ignore if locked
    setCaptureMouse(true);
    setClickedPos({ x: event.clientX, y: event.clientY });
  };

  const captureOff = () => {
    setCaptureMouse(false);
  };

  const panTo = (targetPosition) => {
    if (
      targetPosition.x > bounds.xmin &&
      targetPosition.x < bounds.xmax &&
      targetPosition.y > bounds.ymin &&
      targetPosition.y < bounds.ymax
    ) {
      return;
    } else {
      const newPos = {
        tx: -targetPosition.x + width / scale / 2,
        ty: -targetPosition.y + height / scale / 2,
      };
      // Use a library like gsap for Tweening if needed
      // gsap.to(this, {duration: 1, tx: newPos.tx, ty: newPos.ty});
      setTx(newPos.tx);
      setTy(newPos.ty);
    }
  };

  // Effect to handle pan events
  useEffect(() => {
    const handlePan = (event) => {
      panTo(event.detail);
    };

    svgRef.current.addEventListener("pan", handlePan);
    return () => {
      svgRef.current.removeEventListener("pan", handlePan);
    };
  }, [bounds, scale]);

  // Helper function to bound the zoom multiplier
  const bound = (value, min, max) => {
    return Math.max(min, Math.min(max, value));
  };

  const lineHeight = 25; // Height of each line
  const numLines = Math.floor(height / lineHeight);

  const firstNotePositions = [
    { x: 0, y: -100 },
    { x: 86.5, y: -50 },
    { x: 0, y: 0 },
  ];

  const yOffset = 100; // Example offset value
  const yLimit = 650; // Y-coordinate limit

  // Calculate the number of columns needed to cover the entire width
  const columnXOffset = 86.5; // X offset for each column
  const numColumns = Math.ceil(width / columnXOffset);

  // Generate trichords for multiple columns
  const trichords = [];
  const columnYOffset = -50; // Y offset for even columns

  for (let col = 0; col < numColumns; col++) {
    let currentPositions = firstNotePositions.map((pos) => ({
      ...pos,
      x: pos.x + col * columnXOffset,
      y: pos.y + (col % 2 === 0 ? 0 : columnYOffset),
    }));
    let currentY = Math.max(...currentPositions.map((pos) => pos.y));

    while (currentY <= yLimit) {
      trichords.push(
        <Trichords
          key={`${currentY}-${col}`}
          shape={currentPositions}
          scale={scale}
          tx={tx}
          ty={ty}
          setMatchingPoints={setMatchingPoints} // Pass the setter function
          setActiveChord={setActiveChord} // Pass the setter function for active chord
        />
      );
      currentPositions = calculateNextNotePositions(currentPositions, yOffset);
      currentY = Math.max(...currentPositions.map((pos) => pos.y));
    }
  }

  const handleNoteClick = (note, y) => {
    console.log(`Note: ${note}, Y: ${y}`); // Log the note and y-coordinate
    setSelectedNote(note);
    if (toneGeneratorRef.current) {
      toneGeneratorRef.current.playNoteWithY(note, y); // Pass the y-coordinate and height
    }
  };

  const handleNoteRelease = () => {
    setSelectedNote(null);
  };

  const handleMouseUp = () => {
    setMatchingPoints([]); // Clear matching points
    setActiveChord(null); // Clear active chord
  };

  return (
    <svg
      ref={svgRef}
      className="border border-gray-800 rounded-lg box-border"
      width={width}
      height={height}
      viewBox={viewbox}
      onWheel={zoomInOut}
      onPointerDown={captureOn}
      onPointerUp={captureOff}
      onPointerLeave={captureOff}
      onPointerMove={drag}
      style={{ cursor: captureMouse ? "grabbing" : "grab" }}
    >
      {trichords}
      {Array.from({ length: numLines }).map((_, lineIndex) => {
        const startingNote = getStartingNote(lineIndex);
        const startingIndex = notes.indexOf(startingNote);
        return (
          <g key={lineIndex} transform={transform}>
            {notes.map((note, index) => {
              const cx =
                lineIndex % 2 === 0 ? index * 86.5 : index * 86.5 + 43.25;
              const cy = lineIndex * lineHeight;
              const noteIndex = (startingIndex + index) % notes.length;
              // console.log({ note: notes[noteIndex], x: cx, y: cy });
              // notePositions.push({ note: notes[noteIndex], x: cx, y: cy });

              return (
                <React.Fragment key={`${lineIndex}-${index}`}>
                  <NoteMap note={notes[noteIndex]} x={cx} y={cy} />
                  <Notes
                    key={`${lineIndex}-${index}-note`}
                    cx={cx} // Alternate cx position
                    cy={cy} // Increment cy for each line
                    r={10}
                    note={notes[noteIndex]}
                    onNoteClick={handleNoteClick} // Pass the callback to Notes
                    onNoteRelease={handleNoteRelease} // Pass the release callback to Notes
                    selectedNote={selectedNote} // Pass the selected note to Notes
                    className="first-render-note"
                  />
                </React.Fragment>
              );
            })}
          </g>
        );
      })}
      {matchingPoints.map(({ x, y, note }, index) => (
        <Notes
          key={`matching-${index}`}
          cx={x * scale + tx}
          cy={y * scale + ty}
          r={20}
          note={note}
          onNoteClick={handleNoteClick}
          onNoteRelease={handleNoteRelease}
          selectedNote={note}
          className="re-rendered-note"
        />
      ))}
      <foreignObject
        x="0"
        y="0"
        width="1000"
        height="600"
        style={{ pointerEvents: "none", border: "none" }}
      >
        <div
          style={{
            backgroundColor: "transparent",
            pointerEvents: "auto",
            border: "none",
          }}
        >
          <BottomDrawer graph={graph} setGraph={setGraph} x={950} y={550} />
        </div>
      </foreignObject>
      <ToneGenerator ref={toneGeneratorRef} />{" "}
      <Connector
        isPlaying={isPlaying}
        isPlayingNotes={isPlayingNotes}
        scale={scale}
        tx={tx}
        ty={ty}
      />
      {/* Pass the ref to ToneGenerator */}
    </svg>
  );
};

export default DragZoomSvg;