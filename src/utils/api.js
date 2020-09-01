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
 * @param {Function} filterCallback
 * @return {Array}
 */
function getChunkedList(inputList, chunkSize, filterCallback = null) {
  let currentChunk = [];
  const chunks = [];

  if (typeof filterCallback === 'function') {
    inputList = inputList.filter(filterCallback);
  }

  inputList.forEach((item, i) => {
    currentChunk.push(item);

    if ((currentChunk.length === chunkSize) || (i === inputList.length -1)) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
  });

  return chunks;
}

/**
 * Simple validation over a requests JSON payload to check for issues
 * such as size of request, structure etc... Determines the reply and
 * status code to return back to the calling function.
 * Note: To be moved to a proper middleware later
 * @param {Object} requestPayload
 * @param {Object} maxUrlEntries
 * @return {Object}
 */
function validateAuditRequest(requestPayload, maxUrlEntries) {
  if (typeof (requestPayload.urls) === 'undefined' ||
    requestPayload.urls.length === 0) {
    return {
      valid: false,
      errorMessage: 'URL list not available or empty',
    };
  } else if (requestPayload.urls.length > maxUrlEntries) {
    return {
      valid: false,
      errorMessage: `URL list should not exceed ${maxUrlEntries}`,
    };
  } else {
    return {
      valid: true,
    };
  }
}

/**
 * Converts a base 64 object buffer into a plain object
 * @param {Buffer} objectData
 * @return {String}
 */
function objectFromBuffer(objectData) {
  const buff = new Buffer(objectData, 'base64');
  return JSON.parse(buff.toString('ascii'));
}

/**
 * @param {String} str
 * @return {Boolean}
 */
function isURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+
  '((\\d{1,3}\\.){3}\\d{1,3}))'+
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
  '(\\?[;&a-z\\d%_.~+=-]*)?'+
  '(\\#[-a-z\\d_]*)?$', 'i');

  return pattern.test(str);
}

module.exports = {
  getChunkedList,
  validateAuditRequest,
  objectFromBuffer,
  isURL,
};

