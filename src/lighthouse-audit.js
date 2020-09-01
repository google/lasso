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

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const {BigQuery} = require('@google-cloud/bigquery');

/**
 * Lighthouse Audit
 */
class LighthouseAudit {
  /**
   * Constructor
   * @param {Array} urls
   * @param {Array} blockedRequestPatterns
   * @param {Object} auditConfig
   * @param {Object} auditFieldMapping
   */
  constructor(urls, blockedRequestPatterns = [], auditConfig, auditFieldMapping) {
    this.urls = urls;
    this.blockedRequestPatterns = blockedRequestPatterns;
    this.auditConfig = auditConfig;
    this.auditResults = [];
    this.auditFieldMapping = auditFieldMapping;
  }

  /**
   * Initializes a new puppeteer instance and triggers a set of
   * LH audits to run sequentially
   * @return {Array}
   */
  async run() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    for (let i = 0; i < this.urls.length; i++) {
      const url = this.urls[i];

      try {
        const page = await browser.newPage();
        const metrics = await this.performAudit(url, page, this.blockedRequestPatterns);
        this.auditResults.push(metrics);
      } catch (e) {
        throw new Error(`${e.message} on ${url}`);
      }
    }

    return this.auditResults;
  }

  /**
   * Runs a lighthouse performance audit on specific page in a chrome instance
   * @param {string} url
   * @param {Object} page
   * @param {Array} blockedUrlPatterns
   * @return {Promise}
   */
  async performAudit(url, page, blockedUrlPatterns) {
    const port = page.browser().wsEndpoint().split(':')[2].split('/')[0];
    const options = {
      blockedUrlPatterns,
      port,
    };

    return await lighthouse(url, options, this.auditConfig)
        .then((metrics) => {
          const audits = metrics.lhr.audits;

          if (typeof(audits) != 'undefined' && audits != null) {
            audits['url'] = url;
            return audits;
          }
        }).catch((e) => {
          throw new Error(`LH Audit error: ${e.message}`);
        });
  }

  /**
   * Returns the instance's audit results, properly formatted for
   * inserting into BigQuery. Columns selected are based on the
   * auditFileMapping configuration supplied in the constructor.
   * @return {Array}
   */
  getBQFormatResults() {
    const today = new Date().toJSON().slice(0, 10);
    return this.auditResults.map((audit) => {
      if (typeof (audit) != 'undefined') {
        const formattedAudit = Object.entries(this.auditFieldMapping).
            reduce((res, keyVal) => {
              res[keyVal[0]] = audit[keyVal[1]].numericValue;
              return res;
            }, {});

        formattedAudit['date'] = BigQuery.date(today);
        formattedAudit['url'] = audit.url;
        formattedAudit['blockedRequests'] = this.blockedRequestPatterns.join(',');

        return formattedAudit;
      }
    });
  }

  /**
   * @return {Array}
   */
  getRawResults() {
    return this.auditResults;
  }
}

module.exports = {
  LighthouseAudit,
};
