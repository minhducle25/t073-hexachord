import React from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { Play, Square, Volume2, Trash2, Repeat, Edit2 } from 'lucide-react'

export const Sequence = ({ sequence, removeItem, handleNoteEdit }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-pink-500 mb-2">Sequence</h2>
    <Droppable droppableId="sequence" direction="horizontal">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="flex flex-wrap gap-2"
        >
          {sequence.map((item, index) => (
            <Draggable key={index} draggableId={`item-${index}`} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="relative bg-pink-200 p-2 rounded flex items-center"
                >
                  <span className="mr-2">
                    {item.type === 'note' 
                      ? `${item.value.replace('#', '♯')}${item.octave}`
                      : item.name}
                  </span>
                  <button
                    onClick={() => handleNoteEdit(item, index)}
                    className="text-pink-600 hover:text-pink-700 ml-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-pink-600 hover:text-pink-700 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
)

export const Settings = ({ octave, setOctave, delay, setDelay, synthType, setSynthType, volume, setVolume, synthTypes }) => (
  <div>
    <h2 className="text-xl font-semibold text-pink-500 mb-2">Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Octave</label>
        <select
          value={octave}
          onChange={(e) => setOctave(parseInt(e.target.value))}
          className="mt-1 block w-full p-2 border rounded"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Delay (ms)</label>
        <input
          type="range"
          min="100"
          max="2000"
          step="50"
          value={delay}
          onChange={(e) => setDelay(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-500">{delay}ms</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Synthesizer Type</label>
        <select
          value={synthType}
          onChange={(e) => setSynthType(e.target.value)}
          className="mt-1 block w-full p-2 border rounded"
        >
          {synthTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Volume</label>
        <div className="flex items-center">
          <Volume2 className="h-4 w-4 mr-2" />
          <input
            type="range"
            min="-60"
            max="0"
            step="1"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="ml-2 text-sm text-gray-500">{volume}dB</span>
        </div>
      </div>
    </div>
  </div>
)

export const PlaybackControls = ({ isPlaying, playSequence, stopSequence, isLooping, setIsLooping }) => (
  <div>
    <h2 className="text-xl font-semibold text-pink-500 mb-2">Playback Controls</h2>
    <div className="space-y-4">
      <button
        onClick={isPlaying ? stopSequence : playSequence}
        className="w-full px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
      >
        {isPlaying ? <Square className="inline-block mr-2" /> : <Play className="inline-block mr-2" />}
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <button
        onClick={() => setIsLooping(!isLooping)}
        className={`w-full px-4 py-2 text-white rounded ${isLooping ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-400 hover:bg-pink-500'}`}
      >
        <Repeat className="inline-block mr-2" />
        {isLooping ? 'Stop Looping' : 'Loop Playback'}
      </button>
    </div>
  </div>
)