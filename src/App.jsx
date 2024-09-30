import React, { useState } from "react";
import CircleView from "./components/CircleView";
import TonnetzView from "./components/TonnetzView";
import LoopPlayer from "./components/LoopPlayer";
import Sidebar from "./components/sidebar/SideBar";
// import NoteInput from "./components/NoteInput";
// import PianoApp from "./components/PianoApp";
const App = () => {
  const [notes, setNotes] = useState([{ name: "A", midi: 81 }]);

  const handleNoteChange = (index, newNote) => {
    const updatedNotes = notes.map((note, i) => (i === index ? newNote : note));
    setNotes(updatedNotes);
  };

  return (
    <div
      id="app"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center", // Center the content horizontally
        alignItems: "center", // Align items vertically in the center
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        <TonnetzView notes={notes} />
        <CircleView />
        <Sidebar />
      </div>

      <div>
        <LoopPlayer />
      </div>

      {/* <div>
        {notes.map((note, index) => (
          <NoteInput
            key={index}
            note={note}
            onChange={(newNote) => handleNoteChange(index, newNote)}
          />
        ))}
      </div> */}
      {/* <div>
        <PianoApp />
      </div> */}
    </div>
  );
};

export default App;
