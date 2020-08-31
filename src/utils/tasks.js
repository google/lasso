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

const {CloudTasksClient} = require('@google-cloud/tasks');
const {objectFromBuffer} = require('./api');

/**
 * @param {string} cloudProject
 * @param {string} queueLocation
 * @param {string} tasksQueue
 * @param {number} pageSize
 * @param {string} pageToken
 * @return {object}
 */
async function listActiveTasks(
    cloudProject,
    queueLocation,
    tasksQueue,
    pageSize,
    pageToken) {
  const tasksClient = new CloudTasksClient();
  const parent = tasksClient.queuePath(
      cloudProject,
      queueLocation,
      tasksQueue,
  );

  return tasksClient.listTasks({
    parent,
    responseView: 'FULL',
    pageSize: parseInt(pageSize) || 100,
    pageToken: pageToken || null,
  }, {
    autoPaginate: false,
  },
  );
}

/**
 * @param {Array} taskList
 * @return {Object}
 */
function processTaskResults(taskList) {
  const tasksResults = {
    tasks: [],
    nextPageToken: null,
  };

  if (taskList !== undefined && taskList != null) {
    tasksResults.tasks = taskList['tasks'].map((taskItem) => {
      return {
        name: taskItem.name,
        data: objectFromBuffer(taskItem.httpRequest.body),
        dispatchCount: taskItem.dispatchCount,
        responseCount: taskItem.responseCount,
        firstAttempt: taskItem.firstAttempt,
        lastAttempt: taskItem.lastAttempt,
      };
    });

    tasksResults.nextPageToken = taskList['nextPageToken'];
  }

  return tasksResults;
}

module.exports = {
  listActiveTasks: listActiveTasks,
  processTaskResults: processTaskResults,
};
