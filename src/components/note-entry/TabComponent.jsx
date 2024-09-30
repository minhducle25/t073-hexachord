import React, { useState } from 'react'
import { PianoKey } from './PianoComponent'

export const TabSelector = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 mb-4">
    <button
      className={`py-2 px-4 ${activeTab === 'notes' ? 'border-b-2 border-pink-500' : ''}`}
      onClick={() => setActiveTab('notes')}
    >
      Notes
    </button>
    <button
      className={`py-2 px-4 ${activeTab === 'chords' ? 'border-b-2 border-pink-500' : ''}`}
      onClick={() => setActiveTab('chords')}
    >
      Chords
    </button>
    <button
      className={`py-2 px-4 ${activeTab === 'midi' ? 'border-b-2 border-pink-500' : ''}`}
      onClick={() => setActiveTab('midi')}
    >
      MIDI
    </button>
  </div>
)

export const NoteSelection = ({ addNote, playNote }) => {
  const [playingNote, setPlayingNote] = useState(null)

  const handleNoteClick = (note) => {
    addNote(note)
    playNote(note)
    setPlayingNote(note)
    setTimeout(() => setPlayingNote(null), 200)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-pink-500 mb-2">Note Selection</h2>
      <div className="grid grid-cols-7 gap-1 h-40">
        {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map((note) => (
          <PianoKey
            key={note}
            note={note}
            isPlaying={playingNote === note}
            onClick={handleNoteClick}
          />
        ))}
      </div>
    </div>
  )
}

export const ChordSelection = ({ addChord, playChord, notes, chords }) => (
  <div>
    <h2 className="text-xl font-semibold text-pink-500 mb-2">Chord Selection</h2>
    <div className="grid grid-cols-3 gap-4">
      <select
        onChange={(e) => addChord(e.target.value, "Major")}
        className="p-2 border rounded"
      >
        <option value="">Select root note</option>
        {notes.map((note) => (
          <option key={note} value={note}>{note.replace('#', '♯')}</option>
        ))}
      </select>
      <select
        onChange={(e) => addChord(notes[0], e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Select chord type</option>
        {Object.keys(chords).map((chordType) => (
          <option key={chordType} value={chordType}>{chordType}</option>
        ))}
      </select>
      <button 
        onClick={() => {
          const root = notes[0]
          const chordType = "Major"
          addChord(root, chordType)
          playChord(chords[chordType].map(interval => {
            const noteIndex = (notes.indexOf(root) + interval) % 12
            return notes[noteIndex]
          }))
        }} 
        className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
      >
        Add Chord
      </button>
    </div>
  </div>
)