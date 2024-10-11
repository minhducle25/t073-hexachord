// clearNotesWorker.js
self.onmessage = function (e) {
    const { notes, chunkSize } = e.data;
    const chunks = [];
  
    for (let i = 0; i < notes.length; i += chunkSize) {
      chunks.push(notes.slice(i, i + chunkSize));
    }
  
    for (let i = 0; i < chunks.length; i++) {
      self.postMessage({ type: 'chunk', chunk: chunks[i] });
    }
  
    self.postMessage({ type: 'done' });
  };