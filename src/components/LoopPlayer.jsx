import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';

const LoopPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:000');
  const [duration, setDuration] = useState('00:00:000');
  const [volume, setVolume] = useState(50);
  const [isRecording, setIsRecording] = useState(false);
  const [fileURL, setFileURL] = useState('');
  const [fileName, setFileName] = useState('');
  const synth = useRef(new Tone.PolySynth().toDestination()); 
  const progressBarRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]); 

  // Handle file upload and play the MIDI file using Tone.js
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFileURL(url);
      setFileName(file.name);

      if (file.name.endsWith('.mid')) {
        playMidiFile(file); // Play MIDI file
      } else {
        console.log('Unsupported file format');
      }
    }
  };

  // Play MIDI file using Tone.js
  const playMidiFile = async (file) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      const midiData = e.target.result;
      const midi = await Tone.Midi.fromArrayBuffer(midiData);

      midi.tracks.forEach(track => {
        track.notes.forEach(note => {
          synth.current.triggerAttackRelease(note.name, note.duration, note.time);
        });
      });

      setIsPlaying(true);
      setDuration(formatTime(midi.duration));
      Tone.getContext().resume(); // Use Tone.getContext().resume() to start audio context
    };
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      synth.current.releaseAll(); // Stop all notes
    } else {
      Tone.getContext().resume(); // Resume audio context if it was suspended
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    synth.current.volume.value = newVolume - 50; // Set synth volume
    setVolume(newVolume);
  };

  const handleRecord = () => {
    const audioContext = Tone.getContext(); // Use Tone.getContext() to access audio context
    const destination = audioContext.createMediaStreamDestination();
    const mediaRecorder = new MediaRecorder(destination.stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.start();
    mediaRecorder.ondataavailable = (event) => {
      recordedChunks.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'audio/wav' });
      const recordedURL = URL.createObjectURL(blob);
      setFileURL(recordedURL);
      setIsRecording(false);
      recordedChunks.current = [];
      console.log('Recording stopped and ready for download');
    };

    setIsRecording(true);
    console.log('Recording started');
  };

  const handleStopRecord = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName || 'recording.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStop = () => {
    synth.current.releaseAll(); // Stop all notes
    setIsPlaying(false);
    setCurrentTime(formatTime(0));
    progressBarRef.current.style.width = '0%';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(3, '0')}`;
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const currentTimeSec = Tone.getContext().currentTime; // Use currentTime from Tone.getContext()
        const progressPercentage = (currentTimeSec / Tone.getContext().currentTime) * 100;
        setCurrentTime(formatTime(currentTimeSec));
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${progressPercentage}%`;
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="fixed w-full left-0 bg-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tonnetz Loop Player</h1>
        <input type="file" accept=".mid" onChange={handleFileChange} className="mb-4 p-2 border rounded" />

        <div className="flex items-center gap-4 mb-4">
          <button onClick={handlePlayPause} className={`${isPlaying ? 'bg-red-500' : 'bg-green-500'} hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <label className="text-gray-700">Volume:</label>
          <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-1/4" />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleRecord} className={`${isRecording ? 'bg-red-500' : 'bg-blue-500'} hover:bg-blue-700 text-white font-bold py-2 px-4 rounded`}>
            {isRecording ? 'Recording...' : 'Record'}
          </button>
          <button onClick={handleStopRecord} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
            Stop Record
          </button>
          <button onClick={handleDownload} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            Download
          </button>
          <button onClick={handleStop} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Stop
          </button>
        </div>

        <div className="bg-gray-300 rounded-full h-2.5 relative cursor-pointer overflow-hidden">
          <div ref={progressBarRef} className="h-full bg-blue-500" style={{ width: '0%' }}></div>
        </div>

        <div className="flex justify-between font-mono text-sm mt-2">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
};

export default LoopPlayer;
