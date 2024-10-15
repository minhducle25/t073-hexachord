import React, { useState, useRef, useEffect } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { saveAs } from "file-saver";

const LoopPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default volume 80%
  const [midiFile, setMidiFile] = useState(null);
  const [progress, setProgress] = useState(0); // Progress of playback
  const [currentTime, setCurrentTime] = useState(0); // Current time
  const [totalDuration, setTotalDuration] = useState(0); // Total duration of the file
  const [isRecording, setIsRecording] = useState(false); // Track if recording is in progress
  const [recordedData, setRecordedData] = useState(null); // Stores the recorded audio data
  const [loopStart, setLoopStart] = useState(null); // Start of the loop
  const [loopEnd, setLoopEnd] = useState(null); // End of the loop
  const [isLooping, setIsLooping] = useState(false); // Track if looping is enabled
  const [loopRange, setLoopRange] = useState(null); // Visual feedback for loop range
  const recorderRef = useRef(null); // Store the Tone.Recorder instance
  const synth = useRef(null); // To reference the synthesizer
  const timeoutIds = useRef([]); // To store timeout IDs for scheduling notes
  const currentNoteIndex = useRef(0); // To track the current note for pausing/resuming
  const startTime = useRef(0); // To track when playback started
  const pauseTime = useRef(0); // To track when playback was paused
  const playerStartTime = useRef(0); // Reference time when playback begins
  const progressInterval = useRef(null); // Interval to update the progress bar

  useEffect(() => {
    synth.current = new Tone.Synth().toDestination();
  }, []);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMidiUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const midi = new Midi(event.target.result);
        setMidiFile(midi);
        setTotalDuration(midi.duration); // Set total duration for progress bar
        setProgress(0); // Reset progress bar on new upload
        clearTimeouts(); // Clear any existing timeouts if new file is uploaded
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const clearTimeouts = () => {
    timeoutIds.current.forEach(clearTimeout); // Clear all scheduled timeouts
    timeoutIds.current = [];
  };

  const scheduleNotes = (startFrom = 0) => {
    if (!midiFile) return;
  
    const now = Tone.now();
    startTime.current = now; // Store the start time
    midiFile.tracks.forEach((track) => {
      track.notes.slice(startFrom).forEach((note, index) => {
        const timeUntilNote = note.time - currentTime; // Adjust for the current playback time
        if (timeUntilNote >= 0) {
          const timeoutId = setTimeout(() => {
            synth.current.triggerAttackRelease(note.name, note.duration);
            currentNoteIndex.current = startFrom + index + 1; // Update current note index
          }, timeUntilNote * 1000);
          timeoutIds.current.push(timeoutId);
        }
      });
    });
  
    // Start progress bar update
    playerStartTime.current = Tone.now() - currentTime; // Align the reference time with the current playback time
    progressInterval.current = setInterval(updateProgress, 100); // Update progress every 100ms
  };
  

  const updateProgress = () => {
    const elapsedTime = Tone.now() - playerStartTime.current;
    setCurrentTime(elapsedTime); // Update the current time
  
    // Calculate progress as a percentage of the total duration
    const currentProgress = (elapsedTime / totalDuration) * 100;
    if (currentProgress <= 100) {
      setProgress(currentProgress);
    }
  
    // Loop handling: Ensure playback stays within loop range
    if (isLooping && loopStart !== null && loopEnd !== null && elapsedTime >= loopEnd) {
      clearTimeouts(); // Clear any existing scheduled notes
      playerStartTime.current = Tone.now(); // Reset start time to now
      setCurrentTime(loopStart); // Set current time to loop start
      currentNoteIndex.current = midiFile.tracks[0].notes.findIndex(note => note.time >= loopStart); // Update to closest note
      scheduleNotes(currentNoteIndex.current); // Resume scheduling from loop start
    }
  
    // Stop playback if we reach the end of the file
    if (elapsedTime >= totalDuration) {
      handleStop();
    }
  };
  
  

  const handleProgressClick = (e) => {
    const progressBar = e.target;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercentage = clickPosition / rect.width;
    const seekTime = clickPercentage * totalDuration;
  
    // Stop current playback and clear intervals
    clearTimeouts(); // Clear existing scheduled notes
    clearInterval(progressInterval.current); // Stop updating the progress
  
    // Set new playback state
    setCurrentTime(seekTime); // Update current playback time
    setProgress(clickPercentage * 100); // Update the visual progress bar
    playerStartTime.current = Tone.now() - seekTime; // Set a new reference time to align with the seek time
    currentNoteIndex.current = midiFile.tracks[0].notes.findIndex(note => note.time >= seekTime); // Update to the closest note
  
    // Start playback from the new position if music is already playing
    if (isPlaying) {
      scheduleNotes(currentNoteIndex.current);
    }
  };
  
  
  

  const handlePlay = () => {
    if (!midiFile) return;
    setIsPlaying(true);

    if (pauseTime.current) {
      // Resume from pause
      scheduleNotes(currentNoteIndex.current);
      pauseTime.current = 0; // Reset pause time
    } else {
      // Start fresh playback
      scheduleNotes(0);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    pauseTime.current = Tone.now() - startTime.current; // Calculate how much time has passed
    clearTimeouts(); // Clear scheduled notes
    clearInterval(progressInterval.current); // Stop updating progress
  };

  const handleStop = () => {
    setIsPlaying(false);
    clearTimeouts(); // Clear scheduled notes
    clearInterval(progressInterval.current); // Stop updating progress
  
    // Reset playback state
    setProgress(0); // Reset progress bar
    pauseTime.current = 0; // Reset pause time
    currentNoteIndex.current = 0; // Reset the note index
    setCurrentTime(0); // Reset the current time
  };
  

  const handleVolumeChange = (e) => {
    const volumeValue = e.target.value;
    synth.current.volume.value = volumeValue * 40 - 40; // Volume from -40dB to 0dB
    setVolume(volumeValue);
  };

  // Loop functionality
  const handleSetLoopStart = () => {
    setLoopStart(currentTime); // Set the loop start at the current time
    setLoopRange({ start: currentTime, end: loopEnd || currentTime });
  };

  const handleSetLoopEnd = () => {
    setLoopEnd(currentTime); // Set the loop end at the current time
    setLoopRange({ start: loopStart || currentTime, end: currentTime });
  };

  const handleEnableLoop = () => {
    if (loopStart !== null && loopEnd !== null && loopEnd > loopStart) {
      setIsLooping(true); // Enable looping if both points are valid
  
      // Restart playback from loop start
      handleStop(); // Stop the current playback
      setCurrentTime(loopStart); // Set the current time to loop start
      currentNoteIndex.current = midiFile.tracks[0].notes.findIndex(note => note.time >= loopStart); // Update to closest note
      playerStartTime.current = Tone.now() - loopStart; // Set the new reference time
  
      // Resume playback from loop start
      setIsPlaying(true); // Ensure the state reflects that we are playing
      scheduleNotes(currentNoteIndex.current);
    }
  };
  
  

  const handleDisableLoop = () => {
    setIsLooping(false); // Disable looping
    setLoopStart(null); // Reset loop start
    setLoopEnd(null); // Reset loop end
    setLoopRange(null); // Reset visual feedback
  };

  // Recording and downloading functions
  const handleStartRecording = () => {
    if (!isRecording) {
      const recorder = new Tone.Recorder();
      recorderRef.current = recorder;
      synth.current.connect(recorder);
      recorder.start(); // Start recording from the current playback position
      setIsRecording(true);
      setRecordedData(null); // Reset the recorded data
    }
  };

  const handleStopRecording = async () => {
    if (isRecording) {
      const recording = await recorderRef.current.stop(); // Stop recording
      recorderRef.current = null;
      setIsRecording(false);
      setRecordedData(recording); // Store the recorded data for later download
    }
  };

  const handleDownloadRecording = () => {
    if (recordedData) {
      const mp3Blob = new Blob([recordedData], { type: 'audio/mp3' });
      saveAs(mp3Blob, 'recorded-midi.mp3'); // Download the recorded MP3 file
    }
  };

  useEffect(() => {
    return () => {
      // Clean up intervals and synth on component unmount
      clearTimeouts();
      clearInterval(progressInterval.current);
      if (synth.current) {
        synth.current.dispose(); // Dispose of synth when component unmounts
      }
    };
  }, []);

  return (
    <div className="loopPlayer bg-white p-8 rounded-lg shadow-lg w-full">
      <h1 className="text-2xl font-bold mb-4">MIDI Player</h1>

      <input
        type="file"
        accept=".mid,.midi"
        onChange={handleMidiUpload}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <div className="w-full mt-4">
        <div className="relative">
          <div className="bg-gray-200 rounded h-2 w-full cursor-pointer" onClick={handleProgressClick}>
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${progress}%` }}
            ></div>
            {loopRange && (
              <div
                className="absolute bg-yellow-400 opacity-50 h-2"
                style={{
                  left: `${(loopRange.start / totalDuration) * 100}%`,
                  width: `${((loopRange.end - loopRange.start) / totalDuration) * 100}%`,
                }}
              ></div>
            )}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-4">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Play
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Pause
          </button>
        )}
        <button
          onClick={handleStop}
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md"
        >
          Stop
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24"
        />
        <span>Volume: {(volume * 100).toFixed(0)}%</span>
      </div>

      {/* Loop Controls */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleSetLoopStart}
          className="bg-yellow-500 text-white px-4 py-2 rounded shadow-md"
        >
          Set Loop Start
        </button>
        <button
          onClick={handleSetLoopEnd}
          className="bg-yellow-500 text-white px-4 py-2 rounded shadow-md"
        >
          Set Loop End
        </button>
        <button
          onClick={handleEnableLoop}
          className="bg-green-500 text-white px-4 py-2 rounded shadow-md"
        >
          Enable Loop
        </button>
        <button
          onClick={handleDisableLoop}
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md"
        >
          Disable Loop
        </button>
      </div>

      {/* Recording Buttons */}
      <div className="flex space-x-4 mt-6">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="bg-purple-500 text-white px-4 py-2 rounded shadow-md"
          >
            Start Recording
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="bg-orange-500 text-white px-4 py-2 rounded shadow-md"
          >
            Stop Recording
          </button>
        )}
      </div>

      {recordedData && !isRecording && (
        <div className="mt-4">
          <button
            onClick={handleDownloadRecording}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-md"
          >
            Download MP3
          </button>
        </div>
      )}
    </div>
  );
};

export default LoopPlayer;
