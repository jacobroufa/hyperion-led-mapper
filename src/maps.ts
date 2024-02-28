import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { defaultKey } from './default';
import HLMElement from './element';
import HLMStorage from './storage';

import type { Fixture, HLMKey, LedLayout } from './types';

@customElement('hlm-maps')
export default class Maps extends HLMElement {
  @property({ type: Array }) keys: Array<HLMKey> = [];

  @query('details') mapList?: HTMLDetailsElement;
  @query('#create') dialog?: HTMLDialogElement;
  @query('#name') input?: HTMLInputElement;
  @query('#export') exportDialog?: HTMLDialogElement;
  @query('#export-config') exportConfig?: HTMLTextAreaElement;

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
    if (this.keys.length === 1) {
      this.#updateKey(this.keys[0]);
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

  #exportMap(event: MouseEvent) {
    const key = ((event.target as HTMLAnchorElement).dataset.key ?? '').trim() as HLMKey;
    const width = HLMStorage.retrieve('width', key);
    const height = HLMStorage.retrieve('height', key);
    const fixtures = HLMStorage.retrieve<Fixture[]>('fixtures', key)
      .sort((a, b) => (a.id <= b.id) ? -1 : 1)
      .map(fixture => {
        const fixLeds = [...fixture.leds || []];
        const offsetLeds = fixLeds?.splice(fixture.ledOffset as number);
        const leds = [...offsetLeds, ...fixLeds];

        return {
          width: fixture.width,
          height: fixture.height,
          coords: fixture.coords,
          leds
        };
      }).map(fix => {
        const xScale = fix.width / width;
        const yScale = fix.height / height;
        const [xOrigin, yOrigin] = fix.coords;

        return fix.leds?.map(([xLed, yLed]) => {
          const h = (xLed * xScale) + xOrigin;
          const v = (yLed * yScale) + yOrigin;

          return {
            hmin: this._float(h - 0.01),
            hmax: this._float(h + 0.01),
            vmin: this._float(v - 0.01),
            vmax: this._float(v + 0.01)
          };
        }) as LedLayout[];
      }).reduce((prev, leds) => ([ ...prev as LedLayout[], ...leds ]), []);

    this.exportConfig!.value = JSON.stringify(fixtures, null, 2);
    this.exportDialog!.show();
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
        <button @click=${this.#exportMap} class="export" data-key=${key}>
          Export
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

      <dialog id="export">
        <strong>Hyperion LED Configuration</strong>
        <p>Open your Hyperion control panel and navigate to LED Instances > LED Output on the left sidebar. Switch to the LED Layout tab and open the bottom accordion panel: Generated/Current LED Configuration. Paste the following configuration into the text field and choose Update Preview to view and Save Layout to load it into your Hyperion instance.</p>
        <textarea id="export-config" name="export-config" width="100%"></textarea>
        <button @click=${() => this.exportDialog!.close()}>Close</button>
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

    button.export {
      margin-left: 5rem
    }

    #export[open] {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      margin: 2rem;
      z-index: 100;
    }

    #export * {
      display: inline-block;
      margin: 0;
    }

    #export textarea {
      height: 25rem;
    }

    #export button {
      align-self: flex-end;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-maps': Maps
  }
}