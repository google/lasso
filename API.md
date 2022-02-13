## Using the service API

### /audit (POST)

Runs one or more audits sequentially, utilizing a shared puppeteer instance between tests. Logs results to the configured BQ dataset table.

**Parameters**

| Name | Type | Optional | Description
| ------------- | ------------- | ------------- | ------------- |
| urls  | Array | | List of urls to run a lighthouse audit on |
| blockedRequests  | Array | Yes | List of requests to block on each audit e.g. 3rd party tag origins |

**Example**

```
curl -X POST \
  http://127.0.0.1:8080/audit \
  -H 'content-type: application/json' \
  -d '{
  "urls": [
    "https://www.exampleurl1.com",
    "https://www.exampleurl1.com",
    ...
    ],
  "blockedRequests": [
    "https://www.someblockedrequestdomain.com"
    ]
  }'
```

### /audit-async (POST)

Schedules one or more audits to run asynchronously, utilizing [Cloud Tasks](https://cloud.google.com/tasks). Each dispatched task calls `/audit` as a target to run and log the test.

| Name | Type | Optional | Description
| ------------- | ------------- | ------------- | ------------- |
| urls  | Array | | List of urls to run a lighthouse audit on |
| blockedRequests  | Array | Yes | List of requests to block on each audit e.g. 3rd party tag origins |

**Example**

```
curl -X POST \
  http://127.0.0.1:8080/audit-async \
  -H 'content-type: application/json' \
  -d '{
  "urls": [
    "https://www.exampleurl1.com",
    "https://www.exampleurl1.com",
    ...
    ],
  "blockedRequests": [
    "https://www.someblockedrequestdomain.com"
    ]
  }'
```

### /active-tasks (GET)

Lists all the active audit tasks that are in queue along with the payload and status. Applies pagination to results.

| Name | Type | Optional | Description
| ------------- | ------------- | ------------- | ------------- |
| pageSize  | Number | Yes | Number of items to return per page |
| nextPageToken  | String | Yes | Token to access results in the next page |
