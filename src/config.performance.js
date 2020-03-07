module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-meaningful-paint',
      'first-contentful-paint',
      'speed-index',
      'estimated-input-latency',
      'first-interactive',
      'consistently-interactive',
      'time-to-first-byte',
      'first-cpu-idle',
      'interactive'
    ],
  },
};