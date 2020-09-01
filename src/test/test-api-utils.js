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

const assert = require('chai').assert;
const suite = require('mocha').suite;
const test = require('mocha').test;
const {getChunkedList, validateAuditRequest} = require('../utils/api');


suite('getChunkedList tests', () => {
  test('Returns an empty list if the input is empty', () => {
    const expected = [];
    const result = getChunkedList([], 3);

    assert.deepEqual(result, expected);
  });

  test('Return single chunk if input less or equal than input chunk size', () => {
    const expected = [['one', 'two', 'three']];
    const result = getChunkedList(['one', 'two', 'three'], 3);
    assert.deepEqual(result, expected);
  });

  test('Return multiple chunks when input greater than chunk size', () => {
    const expected = [['one', 'two', 'three'], ['four', 'five']];
    const result = getChunkedList(['one', 'two', 'three', 'four', 'five'], 3);
    assert.deepEqual(result, expected);
  });

  test('Filter out values in the input list based on a filter callback', () => {
    const isEvenNum = (x) => x % 2 !== 0;
    const expected = [[1, 3, 5], [7, 9]];
    const result = getChunkedList([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, isEvenNum);

    assert.deepEqual(result, expected);
  });
});

suite('validateAuditSchedule', () => {
  test('Return error when URL list is not present', () => {
    const expected = {
      valid: false,
      errorMessage: 'URL list not available or empty',
    };
    const requestPayload = {'potato': ['one']};

    const result = validateAuditRequest(requestPayload, 10);
    assert.deepEqual(result, expected);
  });

  test('Return error when URL list is empty', () => {
    const expected = {
      valid: false,
      errorMessage: 'URL list not available or empty',
    };
    const requestPayload = {'urls': []};
    const result = validateAuditRequest(requestPayload, 10);
    assert.deepEqual(result, expected);
  });

  test('Return error when URL list count is greater than a threshold', () => {
    const maxEntries = '4';
    const expected = {
      valid: false,
      errorMessage: `URL list should not exceed ${maxEntries}`,
    };

    const requestPayload = {'urls': [
      'http://one.com',
      'http://two.com',
      'http://three.com',
      'http://four.com',
      'http://five.com',
    ]};

    const result = validateAuditRequest(requestPayload, maxEntries);
    assert.deepEqual(result, expected);
  });

  test('Return success object when all required tests pass', () => {
    const expected = {
      valid: true,
    };

    const requestPayload = {'urls': [
      'http://two.com',
      'http://three.com',
      'http://four.com',
      'http://five.com',
    ]};

    const result = validateAuditRequest(requestPayload, 4);
    assert.deepEqual(result, expected);
  });
});
