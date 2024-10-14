import React, { useEffect, useState } from 'react';
import { categorizedPositions } from '../NoteMap';
import Notes from '../Chords/Notes';

// Utility function to convert MIDI number to note name without octave
const midiToNote = (midiNumber) => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return notes[midiNumber % 12];
};

const replaceSharpWithSymbol = (noteName) => {
  return noteName.replace('#', '♯');
};

const Connector = ({ isPlaying, isPlayingNotes, scale, tx, ty }) => {
  const [renderedNotes, setRenderedNotes] = useState([]);
  const [debugClock, setDebugClock] = useState(0); // For debugging note timings

  useEffect(() => {
    let timeouts = [];

    if (isPlaying && isPlayingNotes.length > 0) {
      setRenderedNotes([]); // Clear the rendered notes before starting
      setDebugClock(0); // Reset the debug clock

      // Group notes by their start time
      const notesByTime = isPlayingNotes.reduce((acc, note) => {
        if (!acc[note.time]) {
          acc[note.time] = [];
        }
        acc[note.time].push(note);
        return acc;
      }, {});

      // Sort the times for sequential processing
      const sortedTimes = Object.keys(notesByTime).map(time => parseFloat(time)).sort((a, b) => a - b);

      sortedTimes.forEach((time, index) => {
        const notes = notesByTime[time];

        // Schedule rendering of notes at this time
        const timeoutId = setTimeout(() => {
          const newRenderedNotes = notes.flatMap(note => {
            let noteName = midiToNote(note.pitch);
            noteName = replaceSharpWithSymbol(noteName);
            const positions = categorizedPositions[noteName];

            if (positions) {
              return positions.map(position => ({
                ...note,
                x: position.x,
                y: position.y,
                noteName: noteName,
                className: 're-rendered-note',
                endTime: time + note.duration, // Store the end time for each note
              }));
            }
            return [];
          });

          setRenderedNotes(prevNotes => [...prevNotes, ...newRenderedNotes]);

          // Update the debug clock for visualization
          setDebugClock(time);

          // Remove each note based on its individual end time
          newRenderedNotes.forEach(renderedNote => {
            const removeTimeoutId = setTimeout(() => {
              setRenderedNotes(prevNotes => prevNotes.filter(note => note.id !== renderedNote.id));
            }, renderedNote.duration * 1500); // Keep the note rendered for its full duration
            timeouts.push(removeTimeoutId);
          });
        }, time * 1000); // Convert time to milliseconds

        timeouts.push(timeoutId);
      });
    } else {
      setRenderedNotes([]);
      setDebugClock(0);
    }

    // Cleanup function to clear timeouts when isPlaying changes
    return () => {
      timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    };
  }, [isPlaying, isPlayingNotes]);

  return (
    <>
      {renderedNotes.map((note, index) => (
        <Notes
          key={index}
          cx={note.x * scale + tx}
          cy={note.y * scale + ty}
          r={20}
          note={replaceSharpWithSymbol(midiToNote(note.pitch))}
          onNoteClick={() => {}}
          onNoteRelease={() => {}}
          selectedNote={replaceSharpWithSymbol(note.noteName)} // Set the selected note to the note name
          className="re-rendered-note" // Pass the className to the Notes component
        />
      ))}
      <div className="debug-clock">
        Debug Clock: {debugClock.toFixed(2)} seconds
      </div>
    </>
  );
};

export default Connector;