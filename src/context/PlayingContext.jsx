import React, { createContext, useState } from "react";

export const PlayingContext = createContext();

export const PlayingProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingNotes, setIsPlayingNotes] = useState([]);

  return (
    <PlayingContext.Provider value={{ isPlaying, setIsPlaying, isPlayingNotes, setIsPlayingNotes }}>
      {children}
    </PlayingContext.Provider>
  );
};