import React, { useState } from 'react';
import TonnetzView from './components/TonnetzView';
import LoopPlayer from './components/LoopPlayer';

const App = () => {
    const [notes, setNotes] = useState([]);

    return (
        <div id="app">
            <TonnetzView notes={notes} />
            <LoopPlayer />
        </div>
    );
};

export default App;