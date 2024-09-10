import React, { useState } from 'react';
import TonnetzView from './components/TonnetzView';

const App = () => {
    const [notes, setNotes] = useState([]);

    return (
        <div id="app">
            <TonnetzView notes={notes} />
        </div>
    );
};

export default App;