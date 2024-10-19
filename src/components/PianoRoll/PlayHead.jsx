import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const Playhead = ({ isPlaying, isPaused, bpm, totalBeats }) => {
  const playheadRef = useRef(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = Date.now();
      const duration = (totalBeats * 60) / bpm; // Total duration of the playhead animation
      gsap.to(playheadRef.current, {
        x: totalBeats * 50, // CELL_WIDTH is 50
        duration: duration,
        ease: "linear",
        onComplete: () => {
          setPlayheadPosition(0); // Reset playhead position when animation completes
        }
      });
    } else if (isPaused) {
      gsap.killTweensOf(playheadRef.current);
      setPlayheadPosition(playheadRef.current.getBoundingClientRect().x); // Set playhead position to current position when paused
    } else {
      gsap.killTweensOf(playheadRef.current);
      setPlayheadPosition(1); // Set playhead position to 1 when not playing to make it visible
      gsap.set(playheadRef.current, { x: 47 });
    }
  }, [isPlaying, isPaused, bpm, totalBeats]);

  return (
    <div
      ref={playheadRef}
      className="absolute top-0 left-0 bg-red-500 opacity-75"
      style={{ width: '2px', height: '255%' }} // Set height to 100% to span the entire grid height
    />
  );
};

export default Playhead;