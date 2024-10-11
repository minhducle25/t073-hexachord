self.importScripts('https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/build/Midi.js');

self.onmessage = async (e) => {
  try {
    const arrayBuffer = e.data;
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      self.postMessage([]); // Send an empty array if the data is invalid
      return;
    }

    const midi = new Midi(arrayBuffer);
    const newNotes = midi.tracks[0].notes.map((note, index) => ({
      id: index,
      pitch: note.midi,
      time: note.time,
      duration: note.duration,
      velocity: note.velocity,
    }));

    self.postMessage(newNotes);
  } catch (error) {
    console.error("Failed to process MIDI file:", error);
    self.postMessage([]);
  }
};