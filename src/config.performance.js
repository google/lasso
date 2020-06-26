module.exports = {
  auditConfig: {
    extends: 'lighthouse:default',
    settings: {
      onlyAudits: [
        'first-contentful-paint',
        'largest-contentful-paint',
        'first-meaningful-paint',
        'speed-index',
        'estimated-input-latency',
        'total-blocking-time',
        'max-potential-fid',
        'cumulative-layout-shift',
        'first-cpu-idle',
        'interactive',
        'server-response-time',
      ],
    },
  },
  auditResultsMapping: {
    'firstContentfulPaint': 'first-contentful-paint',
    'largestContentfulPaint': 'largest-contentful-paint',
    'firstMeaningfulPaint': 'first-meaningful-paint',
    'speedIndex': 'speed-index',
    'estimatedInputLatency': 'estimated-input-latency',
    'totalBlockingTime': 'total-blocking-time',
    'maxPotentialFID': 'max-potential-fid',
    'cumulativeLayoutShift': 'cumulative-layout-shift',
    'firstCpuIdle': 'first-cpu-idle',
    'interactive': 'interactive',
    'serverResponseTime': 'server-response-time'
  },
};
