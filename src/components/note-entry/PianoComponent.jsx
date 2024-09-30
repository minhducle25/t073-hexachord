import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'

export const PianoKey = ({ note, isPlaying, onClick }) => {
  const isSharp = note.includes('#')
  const springProps = useSpring({
    backgroundColor: isPlaying ? '#ff69b4' : isSharp ? '#000' : '#fff',
    height: isPlaying ? '95%' : '100%',
    config: { tension: 300, friction: 10 },
  })

  return (
    <animated.div
      style={{
        ...springProps,
        width: isSharp ? '60%' : '100%',
        position: 'relative',
        border: '1px solid #000',
        cursor: 'pointer',
        zIndex: isSharp ? 1 : 0,
        marginLeft: isSharp ? '-30%' : '0',
      }}
      onClick={() => onClick(note)}
    >
      <span className="absolute bottom-2 left-2 text-xs">
        {note.replace('#', '♯')}
      </span>
    </animated.div>
  )
}

export const PianoRoll = ({ sequence, playingNotes, onNoteClick, onNoteEdit, notes }) => {
  return (
    <div className="flex h-40 bg-pink-50 rounded overflow-x-auto whitespace-nowrap">
      {notes.map((note) => (
        <div key={note} className="flex-1 flex flex-col-reverse">
          {sequence
            .filter((item) => 
              (item.type === 'note' && item.value === note) ||
              (item.type === 'chord' && item.value.includes(note))
            )
            .map((item, index) => (
              <animated.div
                key={`${note}-${index}`}
                style={{
                  height: `${item.duration * 20}%`,
                  backgroundColor: playingNotes.includes(note)
                    ? '#ff69b4'
                    : `hsl(${(notes.indexOf(note) / notes.length) * 360}, 70%, 70%)`,
                  margin: '1px',
                  cursor: 'pointer',
                }}
                onClick={() => onNoteClick(item)}
                onDoubleClick={() => onNoteEdit(item, index)}
              />
            ))}
        </div>
      ))}
    </div>
  )
}

export const NoteEditModal = ({ note, onSave, onClose, notes }) => {
  const [editedNote, setEditedNote] = useState(note)

  const handleSave = () => {
    onSave(editedNote)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Edit Note</h2>
        <div className="mb-4">
          <label className="block mb-2">Note</label>
          <select
            value={editedNote.value}
            onChange={(e) => setEditedNote({ ...editedNote, value: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {notes.map((note) => (
              <option key={note} value={note}>
                {note.replace('#', '♯')}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Duration</label>
          <input
            type="range"
            min="0.25"
            max="4"
            step="0.25"
            value={editedNote.duration}
            onChange={(e) => setEditedNote({ ...editedNote, duration: parseFloat(e.target.value) })}
            className="w-full"
          />
          <span>{editedNote.duration}</span>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Velocity</label>
          <input
            type="range"
            min="0"
            max="127"
            step="1"
            value={editedNote.velocity}
            onChange={(e) => setEditedNote({ ...editedNote, velocity: parseInt(e.target.value) })}
            className="w-full"
          />
          <span>{editedNote.velocity}</span>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} className="px-4 py-2 bg-pink-500 text-white rounded mr-2">Save</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        </div>
      </div>
    </div>
  )
}