'use strict';

const express = require('express');
const {BigQuery} = require('@google-cloud/bigquery');
const perfConfig = require('./config.performance.js');
const {LighthouseAudit} = require('./lighthouse-audit');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const BQ_DATASET = process.env.BQ_DATASET;
const BQ_TABLE = process.env.BQ_TABLE;

const app = express();

app.use(express.raw());
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/', (req, res) => {
  const payload = req.body;
  const lhAudit = new LighthouseAudit(payload.urls, perfConfig);

  lhAudit.run().then((auditResults) => {
    // TODO: Add parameter in URL to make saving to BQ as optional
    writeResultStream(BQ_DATASET, BQ_TABLE, auditResults).then(() => {
      return res.json(auditResults);
    });
    return res.json(auditResults);
  });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

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
    console.log(e);
  }
}
