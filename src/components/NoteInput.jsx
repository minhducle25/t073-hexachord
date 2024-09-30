import React, { useRef } from 'react';
import * as Tone from 'tone';
import ToneGenerator from './ToneGenerator';

const NoteInput = ({ note, onChange }) => {
    const toneGeneratorRef = useRef(null);

    const handleNameChange = (e) => {
        onChange({ ...note, name: e.target.value });
    };

    const handleMidiChange = (e) => {
        onChange({ ...note, midi: parseInt(e.target.value, 10) });
    };

    const handlePlayClick = async () => {
        console.log(`Playing note: ${note.name} with MIDI: ${note.midi}`);
        if (toneGeneratorRef.current) {
            await toneGeneratorRef.current.playMidi(note.midi);
        }
    };

    return (
        <div>
            <label>
                Note Name:
                <input type="text" value={note.name} onChange={handleNameChange} />
            </label>
            <label>
                MIDI:
                <input type="number" value={note.midi} onChange={handleMidiChange} />
            </label>
            <button onClick={handlePlayClick}>Play</button>
            <ToneGenerator ref={toneGeneratorRef} />
        </div>
    );
};

export default NoteInput;