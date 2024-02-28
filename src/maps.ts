import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import HLMStorage from './storage';
import { keyProxy } from './window';

import type { HLMStorageKey } from './types';

@customElement('hlm-maps')
export default class Maps extends LitElement {
  @property({ reflect: true, attribute: true }) key?: HLMStorageKey;

  @property({ type: Array }) keys: Array<HLMStorageKey> = [];

  @query('details') mapList?: HTMLDetailsElement;
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

  updated() {
    if (!this.key) {
      this.mapList!.open = true;
    }
  }

  #createKey(event: Event) {
    event.preventDefault();

    const value: HLMStorageKey = `hlm-${this.input?.value.toLowerCase().replaceAll(' ', '_')}`;

    this.key = value;
    this.keys.push(value);

    keyProxy.hlm = value;

    this.mapList!.removeAttribute('open');

    // create a base map
    HLMStorage.replace({
      height: 50,
      width: 80,
      aspectMultiplier: 0.625,
      aspectRatio: '16:10',
    }, value);

    this.dialog?.close();
  }

  #setKey(event: MouseEvent) {
    const key: string | HLMStorageKey = ((event.target as HTMLAnchorElement).dataset.key ?? '').trim();

    if (HLMStorage.isKey(key)) {
      this.key = key;
      keyProxy.hlm = this.key;
      this.mapList!.removeAttribute('open');
    }
  }

  #deleteKey(event: MouseEvent) {
    const key: string | HLMStorageKey = ((event.target as HTMLAnchorElement).dataset.key ?? '').trim();
    
    if (HLMStorage.isKey(key) && window.confirm('Are you sure you want to delete this map?')) {
      HLMStorage.remove(key);
      this.keys = this.keys.filter(k => k !== key)
      if (key === this.key) {
        this.key = undefined;
        keyProxy.hlm = undefined;
      }
    }
  }

  #showModal() {
    this.dialog?.showModal();
  }

  #renderKeyItem(key: HLMStorageKey) {
    return html`
      <li class="map-row">
        <strong>${key}</strong>
        <button @click=${this.#setKey} data-key=${key}>
          Set Active
        </button>
        <button @click=${this.#deleteKey} class="delete" data-key=${key}>
          Delete
        </button>
      </li>
    `;
  }

  render() {
    return html`
      <details>
        <summary>Current Map: ${this.key ?? 'No Map Loaded'}</summary>

        <ul class="map-container">
          ${this.keys.map(this.#renderKeyItem.bind(this))}
          <li><button @click=${this.#showModal}>Add Map</button></li>
        </ul>
      </details>

      <dialog id="create">
        <label for="name">Map Name</label>
        <input id="name" name="name" type="text" />
        <button @click=${this.#createKey}>Create</button>
      </dialog>
    `;
  }

  static styles = css`
    .map-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0.5rem;
      list-style-type: none;
      padding: 0;
      align-items: flex-start;
    }

    .map-row {
      display: flex;
      gap: 0.5rem;
    }

    strong {
      min-width: 10vw;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-maps': Maps
  }
}