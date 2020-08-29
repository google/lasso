import {html, Component, render} from 'https://unpkg.com/htm/preact/standalone.module.js';
import Header from './components/header.js';
import AuditForm from './components/audit-form.js';
import TasksPanel from './components/tasks-panel.js';

/**
 * App
 */
class App extends Component {
  /**
   * Render
   * @return {*}
   */
  render() {
    return html`
    <div class="main-wrapper">
        <${Header} name="Lasso" />
        <div>
          <div class="panels-wrapper">
          <${AuditForm} />
          <${TasksPanel} />
          </div>
        </div>
    </div>`;
  }
}

render(html`<${App} page="All" />`, document.body);
