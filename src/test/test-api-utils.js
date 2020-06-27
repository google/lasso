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
