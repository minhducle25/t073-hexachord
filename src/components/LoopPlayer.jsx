import React, { useState, useRef } from 'react';

const LoopPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:000');
  const [duration, setDuration] = useState('00:00:000');
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(new Audio());
  const progressBarRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      const audio = audioRef.current;
      audio.src = fileURL;
      audio.onloadedmetadata = () => {
        setDuration(formatTime(audio.duration));
        setVolume(audio.volume * 100);
        setCurrentTime(formatTime(audio.currentTime));
        progressBarRef.current.style.width = '0%';
      };
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    const audio = audioRef.current;
    audio.volume = newVolume / 100;
    setVolume(newVolume);
  };

  const handleRecord = () => {
    if (!isRecording && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.start();
          setIsRecording(true);
          console.log('Recording started');
        })
        .catch(err => console.error('Failed to start recording:', err));
    }
  };

  const handleStopRecord = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log('Recording stopped');
    }
  };

  const handleDownload = () => {
    console.log('Download initiated');
    // This should handle the download of the recorded media or similar
  };

  const handleStop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
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

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-full w-full'">
      <h1 className="text-2xl font-bold mb-6">Tonnetz Loop Player</h1>
      <input type="file" accept=".mid" onChange={handleFileChange} className="mb-4 p-2 border rounded" />
      
      <div className="flex items-center gap-4 mb-4">
        <button onClick={handlePlayPause} className={`${isPlaying ? 'bg-red-500' : 'bg-green-500'} hover:bg-green-700 text-white font-bold py-2 px-4 rounded`}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <label className="text-gray-700">Volume:</label>
        <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="w-1/4" />
      </div>

      <div className="flex items-center gap-4 mb-4">
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
  );
};

export default LoopPlayer;
