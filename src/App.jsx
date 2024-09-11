import React, { useState } from 'react';
import CircleView from './components/CircleView';
import TonnetzView from './components/TonnetzView';
import LoopPlayer from './components/LoopPlayer';


const App = () => {
    const [notes, setNotes] = useState([]);

    return (
        <div id="app"
        style={{
            display:"flex",
            flexDirection: "column",
            justifyContent: "center", // Center the content horizontally
            alignItems: "center", // Align items vertically in the center
            }}>
                <div style={{
                    display: 'flex'
                }}>
                    <TonnetzView notes={notes} />
                    <CircleView />
                </div>

                <div>
                    <LoopPlayer />
                </div>
            
        </div>


    );
};

export default App;

