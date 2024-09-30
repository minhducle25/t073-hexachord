import React from 'react'
import { Upload, Download } from 'lucide-react'
import { Midi } from '@tonejs/midi' // Import the Midi class from @tonejs/midi

export const MidiImport = ({ onMidiImport }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result
        const midi = new Midi(arrayBuffer)
        onMidiImport(midi)
      }
      reader.readAsArrayBuffer(file) // Read the file as an array buffer
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".mid"
        onChange={handleFileChange}
        className="hidden"
        id="midi-file-input"
      />
      <label htmlFor="midi-file-input" className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 cursor-pointer">
        <Upload className="mr-2" />
        Import MIDI
      </label>
    </div>
  )
}

export const MidiTab = ({ handleMidiImport, exportMidi }) => (
  <div>
    <h2 className="text-xl font-semibold text-pink-500 mb-2">MIDI Import/Export</h2>
    <div className="flex justify-between">
      <MidiImport onMidiImport={handleMidiImport} />
      <button onClick={exportMidi} className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600">
        <Download className="inline-block mr-2" />
        Export MIDI
      </button>
    </div>
  </div>
)