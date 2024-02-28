import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit-html/directives/class-map.js';

import HLMStorage from './storage';
import { keyProxy } from './window';

import type { HLMStorageKey } from './types';

@customElement('hlm-maps')
export default class Maps extends LitElement {
  @property({ reflect: true, attribute: true }) key?: HLMStorageKey;

  @property({ type: Array }) keys: Array<HLMStorageKey> = [];

  @query('#create') dialog?: HTMLDialogElement;
  @query('#name') input?: HTMLInputElement;

  constructor() {
    super();
    
    this.keys = HLMStorage.keys;

    if (this.keys.length === 1) {
      this.key = this.keys[0];
      keyProxy.hlm = this.key;
    }
  }

  #createKey(event: Event) {
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

  #setKey(event: MouseEvent) {
    const text: string | HLMStorageKey = ((event.target as HTMLAnchorElement).textContent ?? '').trim();

    if (HLMStorage.isKey(text)) {
      this.key = text;
      keyProxy.hlm = this.key;
    }
  }

  #deleteKey(event: MouseEvent) {
    const key: string | HLMStorageKey = (event.target as HTMLAnchorElement).dataset.key ?? '';
    
    if (HLMStorage.isKey(key) && window.confirm('Are you sure you want to delete this map?')) {
      HLMStorage.remove(key);
      this.keys = this.keys.filter(k => k !== key)
    }
  }

  #showModal() {
    this.dialog?.showModal();
  }

  #renderKeyItem(key: HLMStorageKey) {
    return html`
      <li>
        <a @click=${this.#setKey} class=${classMap({ active: key === this.key })}>
          ${key}
        </a>
        <span> | </span>
        <a @click=${this.#deleteKey} class="delete" data-key=${key}>
          delete
        </a>
      </li>
    `;
  }

  #renderMap() {
    const createNew = html`<a @click=${this.#showModal}>Create a new map</a>`;

    if (!this.keys.length) {
      return createNew;
    }

    return html`
      <strong>Select a map:</strong>
      <ul>
        ${this.keys.map(this.#renderKeyItem.bind(this))}
        <li>${createNew}</li>
      </ul>
    `;
  }

  render() {
    return html`
      <details>
        <summary>Current Map: ${this.key ?? 'No Map Loaded'}</summary>

        ${this.#renderMap()}

        <dialog id="create">
          <label for="name">Map Name</label>
          <input id="name" name="name" type="text" />
          <button @click=${this.#createKey}>Create</button>
        </dialog>
      </details>
    `;
  }

  static styles = css`
    strong {
      display: inline-block;
      margin: 0.5rem 0;
    }

    ul {
      margin: 0;
    }

    a {
      color: darkblue;
      display: inline-block;
      padding: 0.25rem;
    }

    a:hover {
      color: cornflowerblue;
      cursor: pointer;
    }

    a.active {
      background: #2edf3a;
      border-radius: 0.25em;
    }

    a.delete {
      color: darkred;
    }

    a.delete:hover {
      color: orange;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-maps': Maps
  }
}