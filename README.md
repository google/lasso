# Lasso - Lighthouse at Scale

> A solution build on top of [lighthouse](https://github.com/GoogleChrome/lighthouse#readme) to ease testing large number of URLs at once via Cloud Run, Cloud Tasks and BigQuery.

## Getting started

### Running Locally

#### Set Environment Variables

Set the path for the Google Cloud credentials as an ENV variable which will get
picked up by the docker compose config mapped to a volume and set on the running
container

You will also need to make sure to set enviroment variables around the
BQ_DATASET and BQ_TABLE in the docker compose cofig.

#### Run via Docker compose

For local development, you can choose to run the project via [docker compose](https://cloud.google.com/community/tutorials/cloud-run-local-dev-docker-compose). Running `docker-compose up` launches the service.

### Deployment via Cloud Run

Create a build from the Docker file and create a new tag

`docker build -t <your username>/lasso .`

Push the built impage into GCR

For running the image locally or on any other server

```
PORT=8080 && docker run \
   -p 8080:${PORT} \
   -e PORT=${PORT} \
   -e BQ_DATASET=lh_results \
   -e BQ_TABLE=psmetrics \
   -e GOOGLE_APPLICATION_CREDENTIALS=/tmp/keys/lighthouse-service-09c62b8cd84e.json \
   -v $GOOGLE_APPLICATION_CREDENTIALS:/tmp/keys/lighthouse-service-09c62b8cd84e.json:ro \
   gcr.io/lighthouse-service/pagespeed-metrics
```

Deploy new version on cloud run and update ENV vars

### Disclaimer
This is not an officially supported Google product.
