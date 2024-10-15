import React from "react";
import CircleView from "./components/CircleView";
import TonnetzView from "./components/TonnetzView";
import LoopPlayer from "./components/LoopPlayer";
import Sidebar from "./components/sidebar/SideBar";
import { PlayingProvider } from "./context/PlayingContext"; // Import the context provider

const App = () => {
  return (
    <PlayingProvider>
      <div
        id="app"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex" }}>
          <TonnetzView notes={[]} />
          <CircleView />
          <Sidebar />
        </div>
        {/* <div>
          <LoopPlayer />
        </div> */}
      </div>
    </PlayingProvider>
  );
};

export default App;