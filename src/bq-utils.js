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

'use strict';

const {BigQuery} = require('@google-cloud/bigquery');

/**
 * Creates a new BQ date pratitioned table for inserting results
 * @param {*} datasetId
 * @param {*} tableId
 * @param {*} schema
 */
async function createDatePartitionTable(datasetId, tableId, schema) {
  const options = {
    schema: schema,
    location: 'US',
    timePartitioning: {
      type: 'DAY',
      expirationMs: '7776000000',
      field: 'date',
    },
  };

  const bigquery = new BigQuery();
  const [table] = await bigquery
      .dataset(datasetId)
      .createTable(tableId, options);

  console.log(`Table ${table.id} created.`);
}

/**
 * Writes an array of objects into BigQuery
 * @param {*} datasetName
 * @param {*} tableName
 * @param {*} rows
 */
async function writeResultStream(datasetName, tableName, rows) {
  const bigqueryClient = new BigQuery();

  return bigqueryClient
      .dataset(datasetName)
      .table(tableName)
      .insert(rows);
}

module.exports = {
  createDatePartitionTable: createDatePartitionTable,
  writeResultStream: writeResultStream,
};
