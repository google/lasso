// Imports the Google Cloud Tasks library.
const {v2beta3} = require('@google-cloud/tasks');
const { getChunks } = require('./loader.js');

// Instantiates a client.
const client = new v2beta3.CloudTasksClient();

/**
 * TODO: pass those in as command line arguments including the input file
 **/

const project = 'lighthouse-service';
const queue = 'lhcrawl';
const location = 'europe-west1';
const url = 'https://pagespeed-metrics-72xe2ajnpq-ew.a.run.app/';

const args = process.argv.slice(2);
const chunks = getChunks(args[0]);
const parent = client.queuePath(project, location, queue);

let inSeconds = 10;

for(var i = 0; i < chunks.length; i++) {
  let payload = JSON.stringify({"urls":chunks[i]})
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {"Content-Type": "application/json"},
      body: Buffer.from(payload).toString('base64'),
      scheduleTime: (inSeconds + (Date.now() / 1000))
    },
  };

  inSeconds += 10;

  const request = {parent, task};

  client.createTask(request).then((response) => {
    console.log(`Created task ${response.name}`);
  }).catch((e) => {
    console.log(payload);
    console.log(e.message);
  });
}
