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
const apiUtils = require('../api-utils');


suite('getChunkedList tests', () => {
  test('Returns an empty list if the input is empty', () => {
    const expected = [];
    const result = apiUtils.getChunkedList([], 3);

    assert.deepEqual(result, expected);
  });

  test('Return single chunk if input less or equal than input chunk size', () => {
    const expected = [['one', 'two', 'three']];
    const result = apiUtils.getChunkedList(['one', 'two', 'three'], 3);
    assert.deepEqual(result, expected);
  });

  test('Return multiple chunks when input greater than chunk size', () => {
    const expected = [['one', 'two', 'three'], ['four', 'five']];
    const result = apiUtils.getChunkedList(['one', 'two', 'three', 'four', 'five'], 3);
    assert.deepEqual(result, expected);
  });
});
