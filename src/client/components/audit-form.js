import {html} from 'https://unpkg.com/htm/preact/standalone.module.js';

const AuditForm = () => html`
					<aside class="c-input">
						<div class="toolbar">
							New bulk audit
						</div>
						<div class="panel-content">
							<form>
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

export default AuditForm;
