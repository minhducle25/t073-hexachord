import React, { useRef, useEffect, useImperativeHandle } from 'react';
import * as Tone from 'tone';

const ToneGenerator = React.forwardRef((props, ref) => {
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth().toDestination();
    return () => {
      synthRef.current.dispose();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    playNoteWithY: async (note, y) => {
      await Tone.start(); // Ensure Tone.js is started

      // Replace Unicode sharp symbol with standard sharp symbol
      const standardizedNote = note.replace('♯', '#');

      // Define y-coordinate ranges and corresponding octaves for special notes
      const specialNoteRanges = [
        { maxY: 25, octave: 6 },
        { maxY: 100, octave: 5 },
        { maxY: 175, octave: 4 },
        { maxY: Infinity, octave: 3 }
      ];

      // Define y-coordinate ranges and corresponding octaves for general notes
      const generalNoteRanges = [
        { maxY: 75, octave: 5 },
        { maxY: 174, octave: 4 },
        { maxY: 249, octave: 3 },
        { maxY: Infinity, octave: 2 }
      ];

      // Determine the correct octave based on the y-coordinate
      let octave;
      const ranges = ['C', 'C#', 'D', 'D#'].includes(standardizedNote) ? specialNoteRanges : generalNoteRanges;
      for (const range of ranges) {
        if (y <= range.maxY) {
          octave = range.octave;
          break;
        }
      }

      const noteWithOctave = `${standardizedNote}${octave}`;
      console.log(`Playing note: ${noteWithOctave}, Y: ${y}`);

      try {
        const midiNumber = Tone.Frequency(noteWithOctave).toMidi(); // Convert note and octave to MIDI number
        console.log(`MIDI number: ${midiNumber}`);
        const frequency = Tone.Frequency(midiNumber, "midi").toFrequency(); // Convert MIDI number to frequency
        console.log(`Frequency: ${frequency}`);
        synthRef.current.triggerAttackRelease(frequency, "8n");
      } catch (error) {
        console.error(`Error playing note: ${noteWithOctave}`, error);
      }
    }
  }));

  return null; // No need to render anything
});

export default ToneGenerator;