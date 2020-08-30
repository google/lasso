# Lasso - Lighthouse as a service

> An API service built on top of [lighthouse](https://github.com/GoogleChrome/lighthouse#readme) to automate running Lighthouse tests on large number of URLs in parallel. Utilizes [Cloud Run](https://cloud.google.com/run) and [Cloud Tasks](https://cloud.google.com/tasks) to distribute and run multiple tests across multiple containers, outputs results to a [BigQuery](https://cloud.google.com/bigquery) dataset.

## Features

✅ Bulk test 100s of URLs with lighthouse asynchronously

✅ Writes test results to a date partitioned BigQuery table

✅ Specify which resource requests to block from tests e.g. For running tests excluding 3rd party scripts or libraries

## Getting started

- [Setup and deployment guide](SETUP.md)
- [API Service usage](API.md)

## Disclaimer
This is not an officially supported Google product.
