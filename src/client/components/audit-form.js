import {html, Component} from 'https://unpkg.com/htm/preact/standalone.module.js';

/**
 * AuditForm
 */
class AuditForm extends Component {
  /**
   * handleSubmit
   * @param {Object} e
   */
  handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const formObject = {};

    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    const reader = new FileReader();

    reader.onload = ((e) => {
      formObject['urlsTxt'] = e.target.result;
      // TODO: Run validation on all content before calling submit request
      this.submitTasksRequest(formObject);
    });

    reader.readAsText(formObject['urls']);
  }

  /**
   * Submits a request to the API for adding new tasks
   * @param {Object} formData
   */
  submitTasksRequest(formData) {
    const requestObject = {};
    requestObject['urls'] = formData['urlsTxt'].split('\n');

    this.postData('/audit-async', requestObject)
        .then((data) => {
          console.log(data);
        });
  }

  /**
   * postData
   * @param {String} url
   * @param {Object} data
   */
  async postData(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  /**
   * Render
   * @return {*}
   */
  render() {
    return html`
            <aside class="c-input">
              <div class="toolbar">
                New bulk audit
              </div>
              <div class="panel-content">
                <form onSubmit=${ (e) => this.handleSubmit(e) }>
                  <fieldset>
                    <p>
                    <label for="urls">
                      <span>URL List</span>
                      <strong><abbr title="required">*</abbr></strong>
                      <em>.TXT or .CSV</em>
                    </label>
                    <input type="file" name="urls" />
                    </p>

                    <p>
                    <label for="blockedRequest">
                      <span>Blocked Requests</span>
                    </label>
                    <textarea name="blockedRequests" id="about"></textarea>
                    </p>

                    <p>
                    <label for="urlsPerTask">
                      <span>URLs per task</span>
                    </label>
                    <input class="spinner" name="urlsPerTask" type="number" value="1" min="1" max="5" />
                    </p>
                    <input type="submit" />
                  </fieldset>
                </form>
              </div>
            </aside>
      `;
  }
}


export default AuditForm;
