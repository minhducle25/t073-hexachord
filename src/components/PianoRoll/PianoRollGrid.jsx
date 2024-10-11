import React, { useCallback, useRef } from "react";
import { Rnd } from "react-rnd";
import { FixedSizeList as List } from 'react-window';

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [2, 3, 4, 5, 6, 7, 8];
const CELL_WIDTH = 50;
const CELL_HEIGHT = 20;
const TOTAL_BEATS = 16;
const TOTAL_PITCHES = OCTAVES.length * NOTES.length;
const LOWEST_PITCH = OCTAVES[0] * 12;

const PianoRollGrid = ({ notes, setNotes, handleNoteChange, handleNoteDelete, handleNoteCreate }) => {
  const gridRef = useRef(null);

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
            <div key={`${note}${octave}`} className="border-t border-r border-gray-200 h-5">
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
    return (
      <List
        height={30}
        itemCount={TOTAL_BEATS}
        itemSize={CELL_WIDTH}
        layout="horizontal"
        width={TOTAL_BEATS * CELL_WIDTH}
      >
        {TimeGridItem}
      </List>
    );
  }, []);

  return (
    <div className="relative w-full max-w-4xl h-[600px] overflow-auto border border-gray-300 bg-white">
      <div className="absolute inset-0">
        <div className="grid grid-rows-[auto_1fr] h-full">
          <div className="grid grid-cols-[auto_1fr]">
            <div className="w-12 bg-gray-100"></div>
            <div className="grid grid-cols-[repeat(16,50px)]">
              {renderTimeGrid()}
            </div>
          </div>
          <div className="grid grid-cols-[auto_1fr] h-full">
            <div className="w-12 bg-gray-100">{renderGrid()}</div>
            <div className="relative" ref={gridRef} onDoubleClick={handleNoteCreate}>
              <div className="absolute inset-0 grid grid-cols-[repeat(16,50px)] grid-rows-[repeat(72,20px)]">
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