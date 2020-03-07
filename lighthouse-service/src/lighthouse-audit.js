'use strict';

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');

class LighthouseAudit {
    constructor(urls, auditConfig) {
        this.urls = urls;
        this.auditConfig = auditConfig;
        this.auditResults = [];
    }

    /**
     * Runs an audit over the selected urls that are set on initialization
     * @return Array
     */
    async run() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        for(let i = 0; i < this.urls.length; i++) {
            let url = this.urls[i];

            try {
                const page = await browser.newPage();
                // We will need to check the page status at some point,
                // poyentially this step ?
                let response = await page.goto(url);
                let metrics = await this.performAudit(url, page);

                this.auditResults.push(metrics);
            } catch(e) {
                console.log(`${e.message}:(${url})`);
            }
        }

        return this.auditResults;
    }

    /**
     * Runs an audit for a URL on an instance of a puppeteer page
     * @param {String} url
     * @param {Object} page
     */
    async performAudit(url, page) {
        const port = await page.browser().wsEndpoint().split(':')[2].split('/')[0];

        return await lighthouse(page.url(), { port: port }, this.auditConfig).then(metrics => {
            return {
                'url': url,
                'firstContentFulPaint': metrics.lhr.audits['first-contentful-paint'].rawValue,
                'firstMeaningFulPaint': metrics.lhr.audits['first-meaningful-paint'].rawValue,
                'speedIndex': metrics.lhr.audits['speed-index'].rawValue,
                'estimatedInputLatency': metrics.lhr.audits['estimated-input-latency'].rawValue,
                'timeToFirstByte': metrics.lhr.audits['time-to-first-byte'].rawValue,
                'firstCpuIdle': metrics.lhr.audits['first-cpu-idle'].rawValue,
                'timeToInteractive': metrics.lhr.audits['interactive'].rawValue
            };
        }).catch(e => {
            console.log(e);
        });
    }
}

module.exports = {
    LighthouseAudit
}
