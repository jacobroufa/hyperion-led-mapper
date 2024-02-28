import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { defaultKey } from './default';
import HLMElement from './element';
import HLMStorage from './storage';

import type { HLMKey } from './types';

@customElement('hlm-maps')
export default class Maps extends HLMElement {
  @property({ type: Array }) keys: Array<HLMKey> = [];

  @query('details') mapList?: HTMLDetailsElement;
  @query('#create') dialog?: HTMLDialogElement;
  @query('#name') input?: HTMLInputElement;

  constructor() {
    super();
    
    this.keys = HLMStorage.keys;

    if (this.keys.length === 1) {
      this.#updateKey(this.keys[0]);
    }
  }

  updated() {
    if (!this.activeMapKey) {
      this.mapList!.open = true;
    }
  }

  #updateKey(key: HLMKey) {
    this.activeMapKey = key;
    this.emit('hlm-event-map-change', key);
  }

  #createKey(event: Event) {
    event.preventDefault();

    const value: HLMKey = `hlm-${this.input?.value.toLowerCase().replaceAll(' ', '_')}`;

    this.keys.push(value);

    this.#updateKey(value);

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
    const key: string | HLMKey = ((event.target as HTMLAnchorElement).dataset.key ?? '').trim();

    if (HLMStorage.isKey(key)) {
      this.#updateKey(key);

      this.mapList!.removeAttribute('open');
    }
  }

  #deleteKey(event: MouseEvent) {
    const key: string | HLMKey = ((event.target as HTMLAnchorElement).dataset.key ?? '').trim();
    
    if (HLMStorage.isKey(key) && window.confirm('Are you sure you want to delete this map?')) {
      HLMStorage.remove(key);
      this.keys = this.keys.filter(k => k !== key)
      if (key === this.activeMapKey) {
        this.#updateKey(defaultKey);
      }
    }
  }

  #showModal() {
    this.dialog?.showModal();
  }

  #renderKeyItem(key: HLMKey) {
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
        <summary>Current Map: ${this.activeMapKey ?? 'No Map Loaded'}</summary>

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
      min-width: 15vw;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-maps': Maps
  }
}