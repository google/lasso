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

const express = require('express');
const perfConfig = require('./config.performance.js');
const {LighthouseAudit} = require('./lighthouse-audit');
const {CloudTasksClient} = require('@google-cloud/tasks');
const {writeResultStream} = require('./bq-utils');
const apiUtils = require('./api-utils');


const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const CLOUD_TASKS_QUEUE = process.env.CLOUD_TASKS_QUEUE;
const CLOUD_TASKS_QUEUE_LOCATION = process.env.CLOUD_TASKS_QUEUE_LOCATION;
const BQ_DATASET = process.env.BQ_DATASET;
const BQ_TABLE = process.env.BQ_TABLE;
const BQ_DATASET_ID = process.env.BQ_DATASET;
const SERVICE_URL = process.env.SERVICE_URL;

const app = express();

app.use(express.raw());
app.use(express.json({limit: '5mb', extended: true}));
app.use(express.urlencoded({limit: '5mb', extended: true}));

app.post('/audit', performAudit);
app.post('/bulk-schedule', scheduleAudits);


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

  try {
    await lhAudit.run();
  } catch (e) {
    res.status(500);
    return res.json({
      'error': {
        'code': 500,
        'message': e.message,
      },
    });
  }

  try {
    const results = lhAudit.getBQFormatResults();
    writeResultStream(BQ_DATASET, BQ_TABLE, results).then(() => {
      return res.json(results);
    });
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
 * @param {*} req
 * @param {*} res
 * @return {JSON}
 */
async function scheduleAudits(req, res) {
  const chunks = apiUtils.getChunkedList(req.body.urls, 3);
  const tasksClient = new CloudTasksClient();

  const project = GOOGLE_CLOUD_PROJECT;
  const queue = CLOUD_TASKS_QUEUE;
  const location = CLOUD_TASKS_QUEUE_LOCATION;
  const serviceUrl = `${SERVICE_URL}/audit`;
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


module.exports = app;
