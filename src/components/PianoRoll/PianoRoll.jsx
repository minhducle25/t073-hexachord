import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MdFileUpload, MdFileDownload } from "react-icons/md";
import { FaPlay, FaStop } from "react-icons/fa";
import { saveAs } from "file-saver";
import PianoRollGrid from "./PianoRollGrid";
import { PlayingContext } from "../../context/PlayingContext";
import ClearNotes from "./ClearNotes"; // Import the updated component

const initialNotes = [];

export default function PianoRoll() {
  const { isPlaying, setIsPlaying, isPlayingNotes, setIsPlayingNotes } = useContext(PlayingContext); // Use the context
  const [totalBeats, setTotalBeats] = useState(16);
  const [key, setKey] = useState(0); // Add a key state
  const [renderPianoRoll, setRenderPianoRoll] = useState(true); // Add renderPianoRoll state
  const nextId = useRef(
    isPlayingNotes.length > 0 ? Math.max(...isPlayingNotes.map((note) => note.id)) + 1 : 1
  );
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
    midiWorkerRef.current = new Worker(
      new URL("./midiWorker.js", import.meta.url)
    );
    midiWorkerRef.current.onmessage = (e) => {
      const importedNotes = e.data;
      setIsPlayingNotes(importedNotes);
  
      // Calculate the total number of beats required
      const maxTime = importedNotes.length > 0
        ? Math.max(...importedNotes.map((note) => note.time + note.duration))
        : 16; // Default value when there are no notes
      setTotalBeats(Math.ceil(maxTime) || 16); // Ensure totalBeats is never set to -Infinity
    };
    return () => {
      midiWorkerRef.current.terminate();
    };
  }, [setIsPlayingNotes]);
  
  const handleNoteChange = useCallback((id, changes) => {
    setIsPlayingNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === id ? { ...note, ...changes } : note))
    );
  }, [setIsPlayingNotes]);

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
      duration: 1,
      velocity: 1,
    };

    setIsPlayingNotes((prevNotes) => [...prevNotes, newNote]);
    nextId.current += 1;
  }, [setIsPlayingNotes]);

  const handleNoteDelete = useCallback((id, e) => {
    e.preventDefault();
    setIsPlayingNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  }, [setIsPlayingNotes]);

  const playNotes = useCallback(() => {
    if (isPlaying) {
      stopNotes();
    } else {
      setIsPlaying(true);

      const part = new Tone.Part(
        (time, note) => {
          synth.current.triggerAttackRelease(
            Tone.Frequency(note.pitch, "midi"),
            note.duration,
            time,
            note.velocity
          );
        },
        isPlayingNotes.map((note) => ({
          time: note.time,
          pitch: note.pitch,
          duration: note.duration,
          velocity: note.velocity,
        }))
      ).start(0);

      part.loop = false;
      Tone.Transport.start();
      partRef.current = part;

      const maxTime = Math.max(
        ...isPlayingNotes.map((note) => note.time + note.duration)
      );
      setTimeout(() => {
        setIsPlaying(false);
        Tone.Transport.stop();
        part.dispose();
      }, (maxTime + 1) * 1000);
    }
  }, [isPlaying, isPlayingNotes, setIsPlaying]);

  const stopNotes = useCallback(() => {
    setIsPlaying(false);
    Tone.Transport.stop();
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }
  }, [setIsPlaying]);

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

    isPlayingNotes.forEach((note) => {
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
    const blob = new Blob([midiData], { type: "audio/midi" });
    saveAs(blob, "exported_midi.mid");
  };

  return (
    <div key={key} className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 p-4"> {/* Add key prop */}
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
        <ClearNotes setIsPlayingNotes={setIsPlayingNotes} setTotalBeats={setTotalBeats} setRenderPianoRoll={setRenderPianoRoll} isPlayingNotes={isPlayingNotes} />
      </div>
      {renderPianoRoll && (
        <PianoRollGrid
          notes={isPlayingNotes}
          setNotes={setIsPlayingNotes}
          handleNoteChange={handleNoteChange}
          handleNoteDelete={handleNoteDelete}
          handleNoteCreate={handleNoteCreate}
          totalBeats={totalBeats}
        />
      )}
    </div>
  );
}