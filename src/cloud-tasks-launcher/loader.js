const fs = require('fs');

function getChunks(filepath) {
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');

  const maxPerChunk = 3;
  let currentChunk = [];
  let chunks = [];

  lines.forEach(function(item, i) {
    if (currentChunk.length >= maxPerChunk) {
      chunks.push(currentChunk);
      currentChunk = [];
    }

    currentChunk.push(item);
  });

  return chunks;
}

module.exports = {
  getChunks: getChunks
}
