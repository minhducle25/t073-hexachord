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
  const [playingNoteIndex, setPlayingNoteIndex] = useState(0);

  useEffect(() => {
    if (isPlaying && isPlayingNotes.length > 0) {
      setRenderedNotes([]); // Clear the rendered notes before starting

      // Group notes by their start time
      const notesByTime = isPlayingNotes.reduce((acc, note) => {
        if (!acc[note.time]) {
          acc[note.time] = [];
        }
        acc[note.time].push(note);
        return acc;
      }, {});

      const times = Object.keys(notesByTime).map(time => parseFloat(time)).sort((a, b) => a - b);

      const handleNotesAtTime = (timeIndex) => {
        if (timeIndex >= times.length) return;

        const time = times[timeIndex];
        const notes = notesByTime[time];

        const renderNotes = () => {
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
              }));
            }
            return [];
          });

          setRenderedNotes(prevNotes => [...prevNotes, ...newRenderedNotes]);

          // Clear the rendered notes for the previous notes and handle the next group of notes immediately
          setTimeout(() => {
            requestAnimationFrame(() => {
              setRenderedNotes([]);
              handleNotesAtTime(timeIndex + 1); // Handle the next group of notes immediately
            });
          }, Math.max(...notes.map(note => note.duration)) * 1000); // Adjust the delay based on the longest note duration
        };

        setTimeout(renderNotes, time * 1000);
      };

      handleNotesAtTime(playingNoteIndex);
    } else {
      setRenderedNotes([]);
      setPlayingNoteIndex(0);
    }
  }, [isPlayingNotes, isPlaying]);

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
    </>
  );
};

export default Connector;