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

const path = require('path');
const express = require('express');
const perfConfig = require('./config.performance.js');
const {LighthouseAudit} = require('./lighthouse-audit');
const {CloudTasksClient} = require('@google-cloud/tasks');
const {writeResultStream} = require('./utils/bq');
const {getChunkedList, isURL} = require('./utils/api');
const {listActiveTasks, processTaskResults} = require('./utils/tasks');
const {
  auditRequestValidation,
  asyncAuditRequestValidation,
  activeTasksRequestValidation} = require('./utils/validate');

const app = express();

app.use(express.raw());
app.use(express.json({limit: '5mb', extended: true}));
app.use(express.urlencoded({limit: '5mb', extended: true}));

app.use(express.static('client'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/client/index.html'));
});

app.post('/audit', auditRequestValidation, performAudit);
app.post('/audit-async', asyncAuditRequestValidation, scheduleAudits);
app.get('/active-tasks', activeTasksRequestValidation, getActiveTasks);

/**
 * Performs a lighthouse audit on a set of URLs supplied in the payload
 * @param {Object} req
 * @param {Object} res
 */
async function performAudit(req, res) {
  const BQ_DATASET = process.env.BQ_DATASET;
  const BQ_TABLE = process.env.BQ_TABLE;
  const payload = req.body;

  const lhAudit = new LighthouseAudit(
      payload.urls,
      payload.blockedRequests,
      perfConfig.auditConfig,
      perfConfig.auditResultsMapping);

  try {
    await lhAudit.run();
    const results = lhAudit.getBQFormatResults();
    await writeResultStream(BQ_DATASET, BQ_TABLE, results);

    return res.json(results);
  } catch (e) {
    res.status(500);
    return res.json({
      'error': {
        'code': 500,
        'message': e.message,
      },
    });
  }
}

/**
 * Divides a set of URLs in the payload to equal sized chunks and push
 * them into cloud tasks to run be run as async. The cloud tasks use
 * the /audit endpoint to run each smaller set of audits.
 * @param {Object} req
 * @param {Object} res
 * @return {JSON}
 */
async function scheduleAudits(req, res) {
  const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
  const CLOUD_TASKS_QUEUE = process.env.CLOUD_TASKS_QUEUE;
  const CLOUD_TASKS_QUEUE_LOCATION = process.env.CLOUD_TASKS_QUEUE_LOCATION;
  const SERVICE_URL = process.env.SERVICE_URL;

  const chunks = getChunkedList(req.body.urls, 1, isURL);
  const tasksClient = new CloudTasksClient();
  const serviceUrl = `${SERVICE_URL}/audit`;

  const parent = tasksClient.queuePath(
      GOOGLE_CLOUD_PROJECT,
      CLOUD_TASKS_QUEUE_LOCATION,
      CLOUD_TASKS_QUEUE,
  );

  let inSeconds = 10;
  const createTasks = [];
  let blockedRequests = [];

  if (typeof req.body.blockedRequests != 'undefined') {
    blockedRequests = req.body.blockedRequests;
  }

  for (let i = 0; i < chunks.length; i++) {
    const payload = JSON.stringify({
      'urls': chunks[i],
      'blockedRequests': blockedRequests,
    });

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
    const [response] = await tasksClient.createTask(request);
    createTasks.push({
      name: response.name,
      urls: chunks[i],
    });
  }

  return res.json({'tasks': createTasks});
}

/**
 * Lists all the tasks that are currently active
 * @param {Object} req
 * @param {Object} res
 * @return {JSON}
 */
async function getActiveTasks(req, res) {
  try {
    const tasksResults = await listActiveTasks(
        process.env.GOOGLE_CLOUD_PROJECT,
        process.env.CLOUD_TASKS_QUEUE_LOCATION,
        process.env.CLOUD_TASKS_QUEUE,
        req.query.pageSize,
        req.query.pageToken,
    );
    const processedResults = processTaskResults(tasksResults[2]);
    return res.json(processedResults);
  } catch (e) {
    res.status(500);
    return res.json({
      'error': {
        'code': 500,
        'message': e.message,
      },
    });
  }
}

module.exports = app;
