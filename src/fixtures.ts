import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import HLMStorage from './storage';

import type { Fixture, HLMStorageKey } from './types';
import { keyProxy } from './window';

@customElement('hlm-fixtures')
export default class Fixtures extends LitElement {
  @property({ type: String, attribute: 'active-map-key', reflect: true }) activeMapKey: HLMStorageKey = 'hlm-null';

  @state() fixtures: Array<Fixture> = [];
  @state() fixture?: Fixture;
  @state() fixtureIndex?: number;
  @state() _fixturePlacementIndex?: number;
  @state() _calculatedHeight: number = 0;

  @query('details') fixtureList?: HTMLDetailsElement;
  @query('#fixture') fixtureModal?: HTMLDialogElement;
  @query('#name') fixtureName?: HTMLInputElement;
  @query('.fixture-canvas .inner') fixtureCanvas?: HTMLDivElement;

  constructor() {
    super();
    this.#setLocalProps();
  }

  updated(_changedProperties: Map<keyof Fixtures, Fixtures[keyof Fixtures]>): void {
    const key = _changedProperties.get('activeMapKey');
    if (_changedProperties.has('activeMapKey') && key !== this.activeMapKey) {
      this.#setLocalProps();
    }
  }

  #setLocalProps() {
    if (!this.activeMapKey) return;

    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey) ?? [];

    if (this.fixtureList) {
      this.fixtureList.open = !!this.fixtures.length;
    }
  }

  #setFixtureDetails(event: MouseEvent) {
    const id = (event.target as HTMLButtonElement).dataset.id;
    const numId = parseInt(id ?? '', 10);

    if (id === 'create') {
      this.fixtureIndex = this.fixtures.length;
      this.fixture = {
        id: this.fixtures.length,
        name: '',
        height: 0,
        width: 0,
        coords: [0, 0]
      };
    } else {
      this.fixtureIndex = this.fixtures.findIndex(f => f.id === numId);
      this.fixture = this.fixtures[this.fixtureIndex];
    }

    this.fixtureModal!.showModal();

    this.#setCanvasSize();
  }

  #setPlacement(event: MouseEvent) {
    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);

    if (this._fixturePlacementIndex === id) {
      this._fixturePlacementIndex = undefined;
      this.fixture = undefined;
    } else {
      this._fixturePlacementIndex = this.fixtures.findIndex(f => f.id === id);
      this.fixture = this.fixtures[this._fixturePlacementIndex];
    }

    keyProxy.fixture = this._fixturePlacementIndex ?? -1;
  }

  #removeFixture(event: MouseEvent) {
    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);
    this.fixtures = this.fixtures.filter(fixture => fixture.id !== id);
    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);
  }

  #updateFixtureDimensions(event: CustomEvent<[number, number]>) {
    const [width, height] = event.detail;
    const fix = this.fixture!;
    fix.height = height;
    fix.width = width;

    this.fixture = fix;

    this.#setCanvasSize();
    this.#updateFixture(false);
  }

  #setCanvasSize() {
    if (!this.fixtureCanvas) return;

    const multiplier = this.fixture!.height / this.fixture!.width;
    this._calculatedHeight = multiplier * this.fixtureCanvas!.offsetWidth;
  }

  #updateFixtureName() {
    const fix = this.fixture!;
    fix.name = this.fixtureName!.value;

    this.fixture = fix;

    this.#updateFixture();
  }

  #updateFixture(close: boolean = true) {
    if (this.fixtures.length === this.fixtureIndex) {
      this.fixtures.push(this.fixture!);
    } else {
      this.fixtures.splice(this.fixtureIndex!, 1, this.fixture!);
    }
    this.requestUpdate();

    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);

    if (close) {
      this.fixtureModal!.close();
    }
  }

  #renderFixture(fixture: Fixture, index: number) {
    const currentIndex = index === this._fixturePlacementIndex;
    const name = `${currentIndex ? '** ' : ''}${fixture.name}${currentIndex ? ' **' : ''}`;
    const place = currentIndex ? 'Finish' : 'Set';
    return html`
      <li class="fixture-row">
        <span><strong>${name}</strong> ${fixture?.width}" x ${fixture?.height}"</span>
        <button data-id=${fixture.id} @click=${this.#setFixtureDetails}>Update</button>
        <button data-id=${fixture.id} @click=${this.#setPlacement}>${place} Placement</button>
        <button data-id=${fixture.id} @click=${this.#removeFixture}>Delete</button>
      </li>
    `;
  }

  render() {
    if (this.activeMapKey === 'hlm-null') {
        return;
    }

    return html`
      <details>
        <summary>Fixtures (${this.fixtures.length})</summary>

        <ul class="fixture-container">
          ${this.fixtures.map(this.#renderFixture.bind(this))}
          <li>
            <button data-id="create" @click=${this.#setFixtureDetails}>Add Fixture</button>
          </li>
        </ul>
      </details>

      <dialog id="fixture">
        <div class="fixture-edit-row">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" .value=${this.fixture?.name ?? ''} />
        </div>

        <hlm-size-input 
          class="fixture-edit-input"
          .height=${(this.fixture?.height ?? 0)}
          .width=${this.fixture?.width ?? 0}
          unit="in"
          flexDirection="column"
          @resize=${this.#updateFixtureDimensions}>
          Dimensions
        </hlm-size-input>

        <div class="fixture-canvas">
          <strong>Fixture Layout</strong>
          <div class="inner"></div>
        </div>

        <button @click=${this.#updateFixtureName}>${this.fixtureIndex !== undefined ? 'Update' : 'Create'}</button>
      </dialog>

      <style>
        .fixture-canvas .inner {
          height: ${this._calculatedHeight}px;
        }
      </style>

    `;
  }

  static styles = css`
    details {
      margin: 0.5rem 0;
    }

    .fixture-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0.5rem;
      padding: 0;
      align-items: flex-start;
      list-style-type: none;
    }

    .fixture-row {
      display: flex;
      gap: 0.5rem;
    }

    .fixture-row > span {
      min-width: 15vw;
    }

    dialog[open] {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.5rem;
      align-items: flex-end;
    }

    .fixture-edit-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
    }

    .fixture-edit-input, .fixture-canvas {
      width: 100%;
    }

    .fixture-canvas strong {
      display: inline-block;
      margin: 0.5rem 0;
    }

    .fixture-canvas .inner {
      width: 100%;
      background: #ede2ef;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-fixtures': Fixtures
  }
}