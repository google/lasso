/**
 * Copyright 2020 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 **/

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
