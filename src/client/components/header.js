import {html} from 'https://unpkg.com/htm/preact/standalone.module.js';

const Header = ({name}) => html`<header><h1 class="page-title">${name}</h1></header>`;

export default Header;
