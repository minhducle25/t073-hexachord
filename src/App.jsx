import React, { useState } from 'react';
import CircleView from './components/CircleView';
import TonnetzView from './components/TonnetzView';


const App = () => {
    const [notes, setNotes] = useState([]);

    return (
        <div id="app"
        style={{
            display:"flex",
            justifyContent: "center", // Center the content horizontally
            alignItems: "center", // Align items vertically in the center
            }}>
            <TonnetzView notes={notes} />
            <CircleView />
        </div>
    );
};

export default App;

