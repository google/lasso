'use strict';

const express = require('express');
const {BigQuery} = require('@google-cloud/bigquery');
const perfConfig = require('./config.performance.js');
const {LighthouseAudit} = require('./lighthouse-audit');
const {CloudTasksClient} = require('@google-cloud/tasks');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';
const BQ_DATASET = process.env.BQ_DATASET;
const BQ_TABLE = process.env.BQ_TABLE;

const app = express();

app.use(express.raw());
app.use(express.json({limit: '5mb', extended: true}));
app.use(express.urlencoded({limit: '5mb', extended: true}));

app.get('/', (req, res) => {
  const url = `${req.protocol}://${req.headers.host}`;
  res.send(url);
});

app.post('/audit', performAudit);
app.post('/bulk-schedule', scheduleAudits);
app.get('/create-result-table', createPartitionedTable);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

/**
 * Performs a lighthouse audit on a set of URLs supplied in the payload
 * @param {*} req
 * @param {*} res
 */
async function performAudit(req, res) {
  const payload = req.body;
  const lhAudit = new LighthouseAudit(
      payload.urls,
      perfConfig.auditConfig,
      perfConfig.auditResultsMapping);

  await lhAudit.run();

  const results = lhAudit.getBQFormatResults();

  writeResultStream(BQ_DATASET, BQ_TABLE, results).then(() => {
    return res.json(results);
  });
}

/**
 * Divides a set of URLs in the payload to equal sized chunks and push
 * them into cloud tasks to run be run as async. The cloud tasks use
 * the /audit endpoint to run each smaller set of audits.
 * @param {*} req
 * @param {*} res
 * @return {JSON}
 */
async function scheduleAudits(req, res) {
  const chunks = generateUrlChunks(req.body.urls);
  const tasksClient = new CloudTasksClient();

  const project = 'lighthouse-service';
  const queue = 'lhcrawl';
  const location = 'europe-west1';
  // const serviceUrl = `${req.protocol}://${req.headers.host}/bulk-schedule`;
  const serviceUrl = 'https://lasso-72xe2ajnpq-uc.a.run.app/audit';
  const parent = tasksClient.queuePath(project, location, queue);

  let inSeconds = 10;

  for (let i = 0; i < chunks.length; i++) {
    const payload = JSON.stringify({'urls': chunks[i]});
    const task = {
      httpRequest: {
        httpMethod: 'POST',
        url: serviceUrl,
        headers: {'Content-Type': 'application/json'},
        body: Buffer.from(payload).toString('base64'),
        scheduleTime: (inSeconds + (Date.now() / 1000)),
      },
    };

    inSeconds += 10;

    const request = {parent, task};
    await tasksClient.createTask(request);
  }

  return res.json({'chunks': chunks});
}

/**
 * Splits a large list of strings into equal sized chunks
 * @param {*} urls
 * @return {Array}
 */
function generateUrlChunks(urls) {
  const maxPerChunk = 3;
  let currentChunk = [];
  const chunks = [];

  // Split the urls into chunks of size 3
  urls.forEach(function(item, i) {
    if (currentChunk.length >= maxPerChunk) {
      chunks.push(currentChunk);
      currentChunk = [];
    }

    currentChunk.push(item);
  });

  return chunks;
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

// Before any create or insert operations: Check if the dataset exists and check if the table exists
// All this data needs to be checked + any potential exceptions and to be returned back with the API

/**
 * Creates a new BQ Table
 */
async function createPartitionedTable() {
  const datasetId = 'lh_results';
  const tableId = 'sample_set';
  const schema = `url:string,
  date:date,
  firstContentfulPaint:float,
  largestContentfulPaint:float,
  firstMeaningfulPaint:float,
  speedIndex:float,
  estimatedInputLatency:float,
  totalBlockingTime:float,
  maxPotentialFid:float,
  cumulativeLayoutShift:float,
  firstCpuIdle:float,
  interactive:float,
  serverResponseTime:float`;

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

function checkTableExists() {
 //TODO...
}