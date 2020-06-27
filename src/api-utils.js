/**
 * Transforms an array into multiple chunks of a specific size
 * @param {Array} inputList
 * @param {Integer} chunkSize
 * @return {Array}
 */
function getChunkedList(inputList, chunkSize) {
  let currentChunk = [];
  const chunks = [];

  inputList.forEach((item, i) => {
    currentChunk.push(item);

    if ((currentChunk.length === chunkSize) || (i === inputList.length -1)) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  });

  return chunks;
}

module.exports = {
  getChunkedList,
};
