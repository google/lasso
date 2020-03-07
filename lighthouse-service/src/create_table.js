const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

async function createTable() {
  const datasetId = 'lh_results';
  const tableId = "psmetrics";
  const schema = 'url:string, firstContentFulPaint:float, firstMeaningFulPaint:float, speedIndex:float, estimatedInputLatency:float, timeToFirstByte:float, firstCpuIdle:float, timeToInteractive:float';

  const options = {
    schema: schema,
    location: 'US',
  };

  // Create a new table in the dataset
  const [table] = await bigquery
    .dataset(datasetId)
    .createTable(tableId, options);

  console.log(`Table ${table.id} created.`);
}

(async () => {
  await createTable();
})().catch(err => {
  console.error(err);
});

