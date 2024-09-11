import React, { useState, useEffect, useRef } from "react";
import Notes from "./Chords/Notes";
import ToneGenerator from "./ToneGenerator"; // Import ToneGenerator
import { notes } from "./noteUtils"; // Import the notes array

const CircleView = ({ height = 800, width = 400, lock = false }) => {
    // State to handle transformations and interactions
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);
    const [scale, setScale] = useState(1);
    const [captureMouse, setCaptureMouse] = useState(false);
    const [clickedPos, setClickedPos] = useState({ x: 0, y: 0 });
    const [selectedNote, setSelectedNote] = useState(null); // State to keep track of the selected note

    const svgRef = useRef(null);
    const toneGeneratorRef = useRef(null); // Ref for ToneGenerator

    const transform = `scale(${scale}) translate(${tx} ${ty})`;
    const viewbox = `300 100 380 380`;
    const circleRadius = 120; // Radius of each circle
    const centerX = width / 2; // Center X position for both circles
    const centerY1 = height / 4.5; // Center Y position for the first circle (1/3 of the height)
    const centerY2 = (2 * height) / 2.7; // Center Y position for the second circle (2/3 of the height)

    // Effect to handle lock changes
    useEffect(() => {
        if (lock) captureOff();
    }, [lock]);

    // Functions to handle zoom, drag, and pan
    const zoomInOut = (wheelEvent) => {
        if (lock) return; // Ignore if locked

        let multiplier = Math.exp(-wheelEvent.deltaY / 600);
        multiplier = Math.max(0.5, Math.min(2, scale * multiplier));

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

    const handleNoteClick = (note, y) => {
        setSelectedNote(note);
        if (toneGeneratorRef.current) {
            toneGeneratorRef.current.playNoteWithY(note, y); // Pass the y-coordinate
        }
    };

    const handleNoteRelease = () => {
        setSelectedNote(null);
    };

    // Function to calculate note positions around a circle
    const calculateCirclePoints = (numNotes, radius, centerX, centerY) => {
        const points = [];
        const angleStep = (2 * Math.PI) / numNotes;
        for (let i = 0; i < numNotes; i++) {
            const angle = i * angleStep;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push({ x, y, note: notes[i % notes.length] }); // Map note to the position
        }
        return points;
    };

    const notePositionsCircle1 = calculateCirclePoints(notes.length, circleRadius, centerX, centerY1);
    const notePositionsCircle2 = calculateCirclePoints(notes.length, circleRadius, centerX, centerY2);

    return (
        <svg
            ref={svgRef}
            // className="border border-gray-600 rounded-lg box-border"
            className="rounded-lg box-border"
            width={400}
            height={700}
            viewBox={viewbox}
            onWheel={zoomInOut}
            onPointerDown={captureOn}
            onPointerUp={captureOff}
            onPointerLeave={captureOff}
            onPointerMove={drag}
            style={{ cursor: captureMouse ? "grabbing" : "grab" }}
        >
            <g transform={transform}>
                {/* Render the first circular notes (top circle) */}
                {notePositionsCircle1.map((pos, index) => (
                    <Notes
                        key={`circle1-${index}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={20} // Radius of each note
                        note={pos.note}
                        onNoteClick={handleNoteClick} // Handle note click
                        onNoteRelease={handleNoteRelease} // Handle note release
                        selectedNote={selectedNote} // Highlight selected note
                    />
                ))}

                {/* Render the second circular notes (bottom circle) */}
                {notePositionsCircle2.map((pos, index) => (
                    <Notes
                        key={`circle2-${index}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={20} // Radius of each note
                        note={pos.note}
                        onNoteClick={handleNoteClick} // Handle note click
                        onNoteRelease={handleNoteRelease} // Handle note release
                        selectedNote={selectedNote} // Highlight selected note
                    />
                ))}
            </g>


            {/* Include ToneGenerator for sound handling */}
            <ToneGenerator ref={toneGeneratorRef} />
        </svg>
    );
};

export default CircleView;
