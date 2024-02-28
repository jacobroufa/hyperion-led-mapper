import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { HLMStorageKey, HLMStorage } from './storage';

@customElement('hlm-maps')
export default class Maps extends LitElement {
  @property() key?: HLMStorageKey;

  @state() keys: Array<HLMStorageKey> = [];

  @query('#create') dialog?: HTMLDialogElement;
  @query('#name') input?: HTMLInputElement;

  createKey(event: Event) {
    event.preventDefault();

    const value: HLMStorageKey = `hlm-${this.input?.value.toLowerCase().replaceAll(' ', '_')}`;

    this.key = value;
    this.keys.push(value);

    // create a base map
    HLMStorage.replace({
        height: 480,
        width: 640,
        aspectMultiplier: 0.75,
        aspectRatio: '4:3',
    }, value);

    this.dialog?.close();
  }

  showModal() {
    this.dialog?.showModal();
  }

  setKey(event: MouseEvent) {
    const text: string | HLMStorageKey = (event.target as HTMLAnchorElement).textContent ?? '';
    if (HLMStorage.isKey(text)) {
        this.key = text;
    }
  }

  renderKeyItem(key: HLMStorageKey) {
    return html`
      <li><a @click=${this.setKey}>${key}</a></li>
    `;
  }

  renderMap() {
    const keys = HLMStorage.keys;
    const createNew = html`<a @click=${this.showModal}>Create a new map</a>`;

    if (!keys.length) {
        return createNew;
    }

    return html`
      <p>Select a map:</p>
      <ul>
        ${keys.map(this.renderKeyItem)}
        <li>${createNew}</li>
      </ul>
    `;
  }

  render() {
    return html`
      <details>
        <summary>Current Map: ${this.key ?? 'No Map Loaded'}</summary>

        ${this.renderMap()}

        <dialog id="create">
            <label for="name">Map Name</label>
            <input id="name" name="name" type="text" />
            <button @click=${this.createKey}>Create</button>
        </dialog>
      </details>
    `;
  }

  static styles = css`
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-maps': Maps
  }
}