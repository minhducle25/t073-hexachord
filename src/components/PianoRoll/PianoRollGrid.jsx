import React, { useCallback, useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { FixedSizeList as List } from 'react-window';
import Playhead from './PlayHead'; // Updated import

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [2, 3, 4, 5, 6, 7];
const CELL_WIDTH = 50;
const CELL_HEIGHT = 20;
const TOTAL_PITCHES = OCTAVES.length * NOTES.length;
const LOWEST_PITCH = OCTAVES[0] * 12;

const PianoRollGrid = ({ notes, setNotes, handleNoteChange, handleNoteDelete, handleNoteCreate, totalBeats, isPlaying, bpm }) => {
  const gridRef = useRef(null);

  // Log totalBeats when the component receives it as a prop
  console.log("PianoRollGrid received totalBeats:", totalBeats);

  const renderNote = useCallback(
    ({ id, pitch, time, duration }) => {
      const top = (TOTAL_PITCHES - (pitch - LOWEST_PITCH) - 1) * CELL_HEIGHT;
      const left = time * CELL_WIDTH;
      const width = duration * CELL_WIDTH;

      return (
        <Rnd
          key={id}
          default={{
            x: left,
            y: top,
            width: width,
            height: CELL_HEIGHT,
          }}
          bounds="parent"
          onDragStop={(e, d) => {
            console.log(d);
            
            const newTime = d.x / CELL_WIDTH;
            const newPitch = pitch;
            handleNoteChange(id, { time: newTime, pitch: newPitch });
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            const newDuration = ref.offsetWidth / CELL_WIDTH;
            handleNoteChange(id, { duration: newDuration });
          }}
          enableResizing={{
            right: true,
            left: false,
            top: false,
            bottom: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          minWidth={CELL_WIDTH}
          dragAxis="x"
          onContextMenu={(e) => handleNoteDelete(id, e)}
        >
          <div className="bg-blue-500 h-full w-full rounded-sm opacity-75"></div>
        </Rnd>
      );
    },
    [handleNoteChange, handleNoteDelete]
  );

  const renderGrid = useCallback(() => {
    return OCTAVES.slice()
      .reverse()
      .map((octave) =>
        NOTES.slice()
          .reverse()
          .map((note) => (
            <div
              key={`${note}${octave}`}
              className={`border-t border-r border-gray-200 h-5 ${note.includes('#') ? 'bg-gray-300' : ''}`}
            >
              <span className="text-xs text-gray-500 pl-1">{`${note}${octave - 1}`}</span>
            </div>
          ))
      );
  }, []);

  const TimeGridItem = ({ index, style }) => (
    <div style={style} className="border-r border-b border-gray-200 flex items-center justify-center h-6">
      <span className="text-xs text-gray-500">{index + 1}</span>
    </div>
  );

  const renderTimeGrid = useCallback(() => {
    // Log totalBeats when it is used in renderTimeGrid
    console.log("Rendering time grid with totalBeats:", totalBeats);

    return (
      <div className="relative">
        <List
          height={30}
          itemCount={totalBeats} // Use totalBeats prop
          itemSize={CELL_WIDTH}
          layout="horizontal"
          width={totalBeats * CELL_WIDTH} // Use totalBeats prop
        >
          {TimeGridItem}
        </List>
      </div>
    );
  }, [totalBeats]);

  return (
    <div className="relative w-full max-w-4xl h-[600px] overflow-auto border border-gray-300 bg-white">
      <Playhead isPlaying={isPlaying} bpm={bpm} totalBeats={totalBeats} />
      <div className="absolute inset-0">
        <div className="grid grid-rows-[auto_1fr] h-full">
          <div className="grid grid-cols-[auto_1fr]">
            <div className="w-12 bg-gray-100"></div>
            <div className={`grid grid-cols-[repeat(${totalBeats},50px)]`}>
              {renderTimeGrid()}
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] h-full">
            <div className="w-12 bg-gray-100">{renderGrid()}</div>
            <div className="relative" ref={gridRef} onDoubleClick={handleNoteCreate}>
              <div className={`absolute inset-0 grid grid-cols-[repeat(${totalBeats},50px)] grid-rows-[repeat(72,20px)]`}>
                {notes.filter((note) => note.duration > 0).map(renderNote)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PianoRollGrid;