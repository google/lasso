import {html} from 'https://unpkg.com/htm/preact/standalone.module.js';

const TasksPanel = () => html`
	<main class="c-output">
						<div class="toolbar">
							Active Audit Tasks
						</div>
						<div class="panel-content">
							<table>
								<thead>
									<tr>
										<th>Task name</th>
										<th>Dispatch count</th>
										<th>Response count</th>
										<th>First attempt</th>
										<th>Last attempt</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>0</td>
										<td>0</td>
									  <td>0</td>
										<td>0</td>
										<td>0</td>
									</tr>
								</tbody>
							</table>
						</div>
					</main>
    `;

export default TasksPanel;
