# Lasso Lighthouse X Cloud Run
### Lighthouse At Scale Solution


## Introduction

An implementation of the lighthouse tool running via puppeteer in Cloud Run.

## Setup Guide

### To Run Locally

#### Set Environment Variables

Set the path for the Google Cloud credentials as an ENV variable which will get
picked up by the docker compose config mapped to a volume and set on the running
container

You will also need to make sure to set enviroment variables around the
BQ_DATASET and BQ_TABLE in the docker compose cofig.

#### Run via Docker compose

```
docker-compose up
```

[Reference for using docker
compose](https://cloud.google.com/community/tutorials/cloud-run-local-dev-docker-compose) for local development for Cloud Run

### Deploy to production on CloudRun

Create a build from the Docker file and create a new tag

`docker build -t <your username>/lasso .`


Push the built impage into GCR

// Command here...
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


### Maintaining code style 
`sudo npm install -g eslint eslint-config-google`

### Disclaimer
This is not an officially supported Google product.
