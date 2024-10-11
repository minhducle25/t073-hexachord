import React, { useState, useCallback, useRef, useEffect } from "react";
import * as Tone from "tone";
import {Midi} from "@tonejs/midi";
import { MdFileUpload, MdFileDownload } from "react-icons/md";
import { FaPlay, FaStop } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import PianoRollGrid from "./PianoRollGrid";

const initialNotes = [];

export default function PianoRoll() {
  const [notes, setNotes] = useState(initialNotes);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalBeats, setTotalBeats] = useState(16);
  const nextId = useRef(notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1);
  const synth = useRef(null);
  const midiWorkerRef = useRef(null);
  const partRef = useRef(null);

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    return () => {
      synth.current.dispose();
    };
  }, []);

  useEffect(() => {
    midiWorkerRef.current = new Worker(new URL('./midiWorker.js', import.meta.url));
    midiWorkerRef.current.onmessage = (e) => {
      const importedNotes = e.data;
      setNotes(importedNotes);

      // Calculate the total number of beats required
      const maxTime = Math.max(...importedNotes.map(note => note.time + note.duration));
      setTotalBeats(Math.ceil(maxTime));
    };
    return () => {
      midiWorkerRef.current.terminate();
    };
  }, []);

  const handleNoteChange = useCallback((id, changes) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...changes } : note))
    );
  }, []);

  const handleNoteCreate = useCallback((e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = Math.floor(x / 50);
    const pitch = 24 + 72 - Math.floor(y / 20) - 1;

    const newNote = {
      id: nextId.current,
      pitch,
      time,
      duration: 3,
      velocity: 1,
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);
    nextId.current += 1;
  }, []);

  const handleNoteDelete = useCallback((id, e) => {
    e.preventDefault();
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  }, []);

  const handleClearNotes = () => {
    const chunkSize = 1000; // Adjust the chunk size as needed
    const worker = new Worker(new URL('./clearNotesWorker.js', import.meta.url), { type: 'module' });

    worker.postMessage({ notes, chunkSize });

    worker.onmessage = (e) => {
      if (e.data.type === 'chunk') {
        const chunk = e.data.chunk;
        setNotes((prevNotes) => prevNotes.filter(note => !chunk.includes(note)));
      } else if (e.data.type === 'done') {
        setTotalBeats(16); // Reset total beats to initial value or any default value
        if (midiWorkerRef.current) {
          midiWorkerRef.current.postMessage(new ArrayBuffer(0)); // Send an empty ArrayBuffer to reset the worker's state
        }
        worker.terminate();
      }
    };
  };

  const playNotes = useCallback(() => {
    if (isPlaying) {
      stopNotes();
    } else {
      setIsPlaying(true);

      const part = new Tone.Part((time, note) => {
        synth.current.triggerAttackRelease(
          Tone.Frequency(note.pitch, "midi"),
          note.duration,
          time,
          note.velocity
        );
      }, notes.map(note => ({
        time: note.time,
        pitch: note.pitch,
        duration: note.duration,
        velocity: note.velocity
      }))).start(0);

      part.loop = false;
      Tone.Transport.start();
      partRef.current = part;

      const maxTime = Math.max(...notes.map(note => note.time + note.duration));
      setTimeout(() => {
        setIsPlaying(false);
        Tone.Transport.stop();
        part.dispose();
      }, (maxTime + 1) * 1000);
    }
  }, [isPlaying, notes]);

  const stopNotes = useCallback(() => {
    setIsPlaying(false);
    Tone.Transport.stop();
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }
  }, []);

  const importMidi = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      midiWorkerRef.current.postMessage(arrayBuffer);
    }
  };

  const exportMidi = () => {
    const midi = new Midi();
    const track = midi.addTrack();

    notes.forEach(note => {
      if (note.duration > 0) {
        track.addNote({
          midi: note.pitch,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      }
    });

    const midiData = midi.toArray();
    const blob = new Blob([midiData], { type: 'audio/midi' });
    saveAs(blob, 'exported_midi.mid');
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={playNotes}
        >
          {isPlaying ? <FaStop /> : <FaPlay />}
        </button>
        <button
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => document.getElementById("import-midi-input").click()}
        >
          <MdFileUpload className="text-2xl mr-1" />
        </button>
        <input
          id="import-midi-input"
          type="file"
          accept=".mid"
          onChange={importMidi}
          className="hidden"
        />
        <button className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          <MdFileDownload className="text-2xl mr-1" onClick={exportMidi} />
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={handleClearNotes}
        >
          🗑️
        </button>
      </div>
      <PianoRollGrid
        notes={notes}
        setNotes={setNotes}
        handleNoteChange={handleNoteChange}
        handleNoteDelete={handleNoteDelete}
        handleNoteCreate={handleNoteCreate}
        totalBeats={totalBeats}
      />
    </div>
  );
}