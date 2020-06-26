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

  try {
    await bigqueryClient
        .dataset(datasetName)
        .table(tableName)
        .insert(rows);
  } catch (e) {
    console.log(e.errors);
  }
}

module.exports = {
  createDatePartitionTable: createDatePartitionTable,
  writeResultStream: writeResultStream,
};

