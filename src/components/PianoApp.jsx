import React, { useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { DragDropContext } from 'react-beautiful-dnd';
import MidiWriter from 'midi-writer-js';
import { FixedSizeList as List } from 'react-window';
import { PianoRoll, NoteEditModal } from './note-entry/PianoComponent';
import { TabSelector, NoteSelection, ChordSelection } from './note-entry/TabComponent';
import { Sequence, Settings, PlaybackControls } from './note-entry/ControlComponent';
import { MidiTab } from './note-entry/MidiComponent';

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const synthTypes = ["Piano", "Electric Piano", "Strings", "Organ"];

const chords = {
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "Diminished": [0, 3, 6],
  "Augmented": [0, 4, 8],
  "Major 7th": [0, 4, 7, 11],
  "Minor 7th": [0, 3, 7, 10],
  "Dominant 7th": [0, 4, 7, 10],
  "Diminished 7th": [0, 3, 6, 9],
  "Half-Diminished 7th": [0, 3, 6, 10],
  "Major 6th": [0, 4, 7, 9],
  "Minor 6th": [0, 3, 7, 9],
};

export default function PianoApp() {
  const [sequence, setSequence] = useState([]);
  const [octave, setOctave] = useState(4);
  const [delay, setDelay] = useState(600);
  const [synthType, setSynthType] = useState("Piano");
  const [volume, setVolume] = useState(-10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [synth, setSynth] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [playingNotes, setPlayingNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const newSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    setSynth(newSynth);
    return () => {
      newSynth.dispose();
    };
  }, []);

  useEffect(() => {
    if (synth) {
      synth.volume.value = volume;
    }
  }, [volume, synth]);

  const addNote = (note) => {
    setSequence([...sequence, { type: 'note', value: note, octave, duration: 1, velocity: 100 }]);
  };

  const addChord = (root, chordType) => {
    const chordNotes = chords[chordType].map(interval => {
      const noteIndex = (notes.indexOf(root) + interval) % 12;
      return notes[noteIndex];
    });
    setSequence([...sequence, { type: 'chord', value: chordNotes, octave, name: `${root} ${chordType}`, duration: 1, velocity: 100 }]);
  };

  const removeItem = (index) => {
    const newSequence = [...sequence];
    newSequence.splice(index, 1);
    setSequence(newSequence);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(sequence);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSequence(items);
  };

  const playNote = (note, duration = "8n", velocity = 1) => {
    setPlayingNotes(prev => [...prev, note]);
    synth.triggerAttackRelease(`${note}${octave}`, duration, undefined, velocity);
    setTimeout(() => {
      setPlayingNotes(prev => prev.filter(n => n !== note));
    }, Tone.Time(duration).toMilliseconds());
  };

  const playChord = (chordNotes, duration = "8n", velocity = 1) => {
    setPlayingNotes(chordNotes)
    const fullChord = chordNotes.map(note => `${note}${octave}`)
    synth.triggerAttackRelease(fullChord, duration, undefined, velocity)
    setTimeout(() => {
      setPlayingNotes([])
    }, Tone.Time(duration).toMilliseconds())
  }

  const playSequence = useCallback(async () => {
    setIsPlaying(true);
    const now = Tone.now();
    for (let i = 0; i < sequence.length; i++) {
      const item = sequence[i];
      if (item.type === 'note') {
        playNote(item.value, `${item.duration}n`, item.velocity / 127);
      } else if (item.type === 'chord') {
        playChord(item.value, `${item.duration}n`, item.velocity / 127);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    if (isLooping) {
      playSequence();
    } else {
      setIsPlaying(false);
    }
  }, [sequence, delay, isLooping, synth, octave]);

  const stopSequence = () => {
    setIsPlaying(false);
    Tone.Transport.stop();
    synth.releaseAll();
    setPlayingNotes([]);
  };

  const handleMidiImport = (midiData) => {
    console.log("MIDI Data:", midiData); // Log MIDI data
    const newSequence = [];
    const noteGroups = {};
  
    midiData.tracks.forEach(track => {
      track.notes.forEach(note => {
        if (!noteGroups[note.time]) {
          noteGroups[note.time] = [];
        }
        noteGroups[note.time].push(note);
      });
    });
  
    Object.keys(noteGroups).forEach(time => {
      const notes = noteGroups[time];
      if (notes.length === 1) {
        const note = notes[0];
        const noteName = note.name.match(/[A-G]#?/)[0]; // Extract note name
        const octave = parseInt(note.name.match(/\d/)[0]); // Extract octave number
        newSequence.push({
          type: 'note',
          value: noteName,
          octave: octave,
          duration: note.duration, // Duration in seconds
          velocity: note.velocity * 127 // Convert velocity to 0-127 range
        });
      } else {
        const chordNotes = notes.map(note => note.name.match(/[A-G]#?/)[0]);
        const octave = parseInt(notes[0].name.match(/\d/)[0]); // Assume all notes in the chord have the same octave
        const chordName = chordNotes.join(' '); // Concatenate note names for chord name
        newSequence.push({
          type: 'chord',
          value: chordNotes,
          octave: octave,
          name: chordName,
          duration: notes[0].duration, // Assume all notes in the chord have the same duration
          velocity: notes[0].velocity * 127 // Assume all notes in the chord have the same velocity
        });
      }
    });
  
    console.log("New Sequence:", newSequence); // Log new sequence
    setSequence(newSequence);
  };

  const handleNoteEdit = (note, index) => {
    setEditingNote({ ...note, index });
  };

  const handleNoteSave = (editedNote) => {
    const newSequence = [...sequence];
    newSequence[editedNote.index] = editedNote;
    setSequence(newSequence);
    setEditingNote(null);
  };

  const exportMidi = () => {
    const midi = new MidiWriter.Writer();
    const track = new MidiWriter.Track();

    sequence.forEach(item => {
      if (item.type === 'note') {
        track.addEvent(new MidiWriter.NoteEvent({
          pitch: [`${item.value}${item.octave}`],
          duration: `${item.duration}`,
          velocity: item.velocity
        }));
      } else if (item.type === 'chord') {
        track.addEvent(new MidiWriter.NoteEvent({
          pitch: item.value.map(note => `${note}${item.octave}`),
          duration: `${item.duration}`,
          velocity: item.velocity
        }));
      }
    });

    midi.addTrack(track);
    const write = new Blob([midi.buildFile()], { type: "audio/midi" });
    const url = URL.createObjectURL(write);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_sequence.mid";
    a.click();
    URL.revokeObjectURL(url);
  };

  const Row = ({ index, style }) => {
    const item = sequence[index];
    return (
      <div style={style} className="flex items-center justify-between p-2 border-b">
        <div>
          {item.type === 'note' ? `${item.value}${item.octave}` : `${item.name}`}
        </div>
        <div>
          <button onClick={() => playNote(item.value, `${item.duration}n`, item.velocity / 127)}>Play</button>
          <button onClick={() => removeItem(index)}>Remove</button>
          <button onClick={() => handleNoteEdit(item, index)}>Edit</button> {/* Add Edit button */}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
      <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="mb-6">
        {activeTab === 'notes' && <NoteSelection addNote={addNote} playNote={playNote} />}
        {activeTab === 'chords' && <ChordSelection addChord={addChord} playChord={playChord} notes={notes} chords={chords} />}
        {activeTab === 'midi' && <MidiTab handleMidiImport={handleMidiImport} exportMidi={exportMidi} />}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <List
          height={400}
          itemCount={sequence.length}
          itemSize={50}
          width={'100%'}
        >
          {Row}
        </List>
      </DragDropContext>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Settings 
          octave={octave} 
          setOctave={setOctave} 
          delay={delay} 
          setDelay={setDelay} 
          synthType={synthType} 
          setSynthType={setSynthType} 
          volume={volume} 
          setVolume={setVolume} 
          synthTypes={synthTypes}
        />
        <PlaybackControls 
          isPlaying={isPlaying} 
          playSequence={playSequence} 
          stopSequence={stopSequence} 
          isLooping={isLooping} 
          setIsLooping={setIsLooping} 
        />
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-pink-500 mb-2">Piano Roll Visualization</h2>
        <PianoRoll
          sequence={sequence}
          playingNotes={playingNotes}
          onNoteClick={(item) => {
            if (item.type === 'note') {
              playNote(item.value, `${item.duration}n`, item.velocity / 127);
            } else if (item.type === 'chord') {
              playChord(item.value, `${item.duration}n`, item.velocity / 127);
            }
          }}
          onNoteEdit={handleNoteEdit}
          notes={notes}
        />
      </div>

      {editingNote && (
        <NoteEditModal
          note={editingNote}
          onSave={handleNoteSave}
          onClose={() => setEditingNote(null)}
          notes={notes}
        />
      )}
    </div>
  );
}