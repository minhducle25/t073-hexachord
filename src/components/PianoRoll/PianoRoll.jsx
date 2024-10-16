import React, { useState, useCallback, useRef, useEffect, useContext } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { MdFileUpload, MdFileDownload } from "react-icons/md";
import { FaPlay, FaStop } from "react-icons/fa";
import { saveAs } from "file-saver";
import PianoRollGrid from "./PianoRollGrid";
import { PlayingContext } from "../../context/PlayingContext";
import ClearNotes from "./ClearNotes";

const initialNotes = [];

export default function PianoRoll() {
  const { isPlaying, setIsPlaying, isPlayingNotes, setIsPlayingNotes } = useContext(PlayingContext);
  const [totalBeats, setTotalBeats] = useState(16);
  const [key, setKey] = useState(0);
  const [renderPianoRoll, setRenderPianoRoll] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState(null);
  const [bpm, setBpm] = useState(120);
  const nextId = useRef(
    isPlayingNotes.length > 0 ? Math.max(...isPlayingNotes.map((note) => note.id)) + 1 : 1
  );
  const synth = useRef(null);
  const midiWorkerRef = useRef(null);
  const partRef = useRef(null);
  const recorderRef = useRef(null);

  useEffect(() => {
    synth.current = new Tone.PolySynth(Tone.Synth).toDestination();
    return () => {
      synth.current.dispose();
    };
  }, []);

  useEffect(() => {
    midiWorkerRef.current = new Worker(new URL("./midiWorker.js", import.meta.url));
    midiWorkerRef.current.onmessage = (e) => {
      const importedNotes = e.data;
      const importedBpm = e.data[0]?.bpm || 120;
      setIsPlayingNotes(importedNotes);

      setBpm(importedBpm);
      // Calculate the total number of beats required
      const maxTime = importedNotes.length > 0
        ? Math.max(...importedNotes.map((note) => note.time + note.duration))
        : 16;
      setTotalBeats(Math.ceil(maxTime) || 16);
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
      Tone.Transport.pause();
      setIsPlaying(false);
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
      Tone.Transport.scheduleOnce(() => {
        setIsPlaying(false);
        Tone.Transport.stop();
        part.dispose();
      }, maxTime + 1);
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

  const handleStartRecording = () => {
    if (!isRecording) {
      const recorder = new Tone.Recorder();
      recorderRef.current = recorder;
      synth.current.connect(recorder);
      recorder.start();
      setIsRecording(true);
      setRecordedData(null);
    }
  };

  const handleStopRecording = async () => {
    if (isRecording) {
      const recording = await recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
      setRecordedData(recording);
    }
  };

  const handleDownloadRecording = () => {
    if (recordedData) {
      const mp3Blob = new Blob([recordedData], { type: 'audio/mp3' });
      saveAs(mp3Blob, 'recorded-midi.mp3');
    }
  };

  return (
    <div key={key} className="w-full h-screen flex flex-col items-center justify-center bg-transparent p-4">
      <div className="flex space-x-4 mb-4">
        {!isPlaying ? (
          <button
            onClick={playNotes}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Play
          </button>
        ) : (
          <button
            onClick={playNotes}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Pause
          </button>
        )}
        <button
          onClick={stopNotes}
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md"
        >
          Stop
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
        <button className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={exportMidi}>
          <MdFileDownload className="text-2xl mr-1" />
        </button>
      </div>
      <div className="mt-2 mb-4 flex space-x-4 items-center">
        <button
          onClick={handleStartRecording}
          className="bg-purple-500 text-white px-4 py-2 rounded shadow-md"
        >
          Record
        </button>
        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="bg-orange-500 text-white px-4 py-2 rounded shadow-md"
          >
            Stop Recording
          </button>
        )}
        {recordedData && (
          <button
            onClick={handleDownloadRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Download MP3
          </button>
        )}
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
          isPlaying={isPlaying}
          bpm={bpm}
        />
      )}
    </div>
  );
}
