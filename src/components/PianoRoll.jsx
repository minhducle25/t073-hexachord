import React, { useState, useEffect } from 'react'
import { FaPlay, FaStop } from 'react-icons/fa'
import { MdFileUpload, MdFileDownload } from 'react-icons/md'
import { Midi } from '@tonejs/midi'
import * as Tone from 'tone'

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8]
const ALL_NOTES = OCTAVES.reduce((acc, octave) => {
  return [...acc, ...NOTES.map(note => `${note}${octave}`)]
}, []).reverse()

const TIME_UNITS = 32

const NoteBlock = ({ note, start, duration, onDrag, onResize }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [resizeStartX, setResizeStartX] = useState(0)
  const [currentLeft, setCurrentLeft] = useState((start / TIME_UNITS) * 100)
  const [currentWidth, setCurrentWidth] = useState((duration / TIME_UNITS) * 100)

  const top = ALL_NOTES.indexOf(note) * 20

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
  }

  const handleResizeMouseDown = (e) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStartX(e.clientX)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX
      const newLeft = Math.round((currentLeft + (deltaX / e.target.parentElement.offsetWidth) * 100) / (100 / TIME_UNITS)) * (100 / TIME_UNITS)
      setCurrentLeft(newLeft)
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartX
      const newWidth = Math.max(100 / TIME_UNITS, Math.round((currentWidth + (deltaX / e.target.parentElement.offsetWidth) * 100) / (100 / TIME_UNITS)) * (100 / TIME_UNITS))
      setCurrentWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      const newStart = Math.round((currentLeft / 100) * TIME_UNITS)
      onDrag(note, newStart)
    } else if (isResizing) {
      setIsResizing(false)
      const newDuration = Math.round((currentWidth / 100) * TIME_UNITS)
      onResize(note, newDuration)
    }
  }

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing])

  return (
    <div
      className="absolute bg-blue-500 opacity-75 border border-blue-700 cursor-pointer"
      style={{
        top: `${top}px`,
        left: `${currentLeft}%`,
        width: `${currentWidth}%`,
        height: '20px',
        zIndex: 1, // Ensure NoteBlock is above the grid
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
        onMouseDown={handleResizeMouseDown}
      ></div>
    </div>
  )
}

export default function PianoRoll() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [notes, setNotes] = useState([]) // Initialize as an empty array

  const togglePlay = async () => {
    if (isPlaying) {
      Tone.Transport.stop()
      setIsPlaying(false)
    } else {
      await Tone.start()
      Tone.Transport.bpm.value = bpm
      playNotes()
      Tone.Transport.start()
      setIsPlaying(true)
    }
  }

  const handleBpmChange = (e) => {
    setBpm(e.target.value)
  }

  const importMidi = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const arrayBuffer = await file.arrayBuffer()
      const midi = new Midi(arrayBuffer)
      const newNotes = midi.tracks[0].notes.map(note => ({
        note: note.name,
        start: Math.round(note.ticks / midi.header.ppq), // Quantize start
        duration: Math.round(note.durationTicks / midi.header.ppq), // Quantize duration
      }))
      setNotes(newNotes)
    }
  }

  const exportMidi = () => {
    // Placeholder for MIDI export functionality
    console.log('Export MIDI')
  }

  const playNotes = () => {
    const synth = new Tone.Synth().toDestination()
    // Sort notes by start time
    const sortedNotes = [...notes].sort((a, b) => a.start - b.start)
    console.log('Sorted Notes:', sortedNotes)
    sortedNotes.forEach((note, index) => {
      const time = note.start / TIME_UNITS
      const duration = note.duration / TIME_UNITS
      // Ensure start time is strictly greater than the previous start time
      if (index === 0 || time > sortedNotes[index - 1].start / TIME_UNITS) {
        console.log(`Scheduling note: ${note.note}, Time: ${time}, Duration: ${duration}`)
        Tone.Transport.schedule(time => {
          synth.triggerAttackRelease(note.note, duration, time)
        }, time)
      } else {
        console.warn(`Skipped note: ${note.note}, Time: ${time}, Duration: ${duration} due to overlapping start time`)
      }
    })
  }

  const handleNoteDrag = (note, newStart) => {
    setNotes(prevNotes =>
      prevNotes.map(n => (n.note === note ? { ...n, start: newStart } : n))
    )
  }

  const handleNoteResize = (note, newDuration) => {
    setNotes(prevNotes =>
      prevNotes.map(n => (n.note === note ? { ...n, duration: newDuration } : n))
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isPlaying ? <FaStop /> : <FaPlay />}
          </button>
          <div className="flex items-center">
            <label htmlFor="bpm" className="mr-2">
              BPM:
            </label>
            <input
              type="number"
              id="bpm"
              value={bpm}
              onChange={handleBpmChange}
              className="border rounded px-2 py-1 w-16"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <input
            type="file"
            accept=".mid"
            onChange={importMidi}
            className="hidden"
            id="midi-file"
          />
          <label
            htmlFor="midi-file"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center cursor-pointer"
          >
            <MdFileUpload className="mr-2" /> Import MIDI
          </label>
          <button
            onClick={exportMidi}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <MdFileDownload className="mr-2" /> Export MIDI
          </button>
        </div>
      </div>
      <div className="relative border border-gray-300 overflow-x-auto">
        <div className="flex">
          <div className="w-12 flex-shrink-0">
            {ALL_NOTES.map((note, index) => (
              <div
                key={note}
                className={`h-5 flex items-center justify-end pr-1 text-xs ${
                  note.includes('#') ? 'bg-gray-700 text-white' : 'bg-white'
                }`}
              >
                {note}
              </div>
            ))}
          </div>
          <div className="flex-grow relative">
            <div className="grid grid-cols-32 gap-0 relative z-0">
              {Array.from({ length: TIME_UNITS * ALL_NOTES.length }).map((_, index) => (
                <div
                  key={index}
                  className={`h-5 border-r border-b border-gray-300 ${
                    index % 32 === 0 ? 'border-l' : ''
                  }`}
                ></div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              {notes.map((note, index) => (
                <NoteBlock key={index} {...note} onDrag={handleNoteDrag} onResize={handleNoteResize} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}