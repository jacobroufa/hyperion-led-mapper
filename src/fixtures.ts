import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import HLMStorage from './storage';

import type { Fixture, HLMStorageKey } from './types';

@customElement('hlm-fixtures')
export default class Fixtures extends LitElement {
  @property({ type: String, attribute: 'active-map-key', reflect: true }) activeMapKey: HLMStorageKey = 'hlm-null';

  @state() fixtures: Array<Fixture> = [];
  @state() fixture?: Fixture;
  @state() fixtureIndex?: number;

  @query('#fixture') fixtureModal?: HTMLDialogElement;
  @query('#name') fixtureName?: HTMLInputElement;
  @query('#height') fixtureHeight?: HTMLInputElement;
  @query('#width') fixtureWidth?: HTMLInputElement;

  constructor() {
    super();
    this.#setLocalProps();
  }

  updated(changedProperties: Map<keyof Fixtures, Fixtures[keyof Fixtures]>) {
    const newMapKey = changedProperties.get('activeMapKey');
    if ((!newMapKey || newMapKey === this.activeMapKey) || !this.activeMapKey) return;
    this.#setLocalProps();
  }

  #setLocalProps() {
    if (!this.activeMapKey) return;
    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey) ?? [];
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
  }

  #setPlacement(event: MouseEvent) {
    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);
  }

  #removeFixture(event: MouseEvent) {
    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);
    this.fixtures = this.fixtures.filter(fixture => fixture.id !== id);
    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);
  }

  #updateFixture() {
    const fix = this.fixture!;
    fix.name = this.fixtureName!.value;
    fix.height = parseFloat(this.fixtureHeight!.value);
    fix.width = parseFloat(this.fixtureWidth!.value);

    this.fixture = fix;

    if (this.fixtures.length === this.fixtureIndex) {
      this.fixtures.push(fix);
    } else {
      this.fixtures.splice(this.fixtureIndex!, 1, fix);
    }
    this.requestUpdate();

    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);

    this.fixtureModal!.close();
  }

  #renderFixture(fixture: Fixture) {
    return html`
      <li class="fixture-row">
        <strong>${fixture.name}</strong>
        <button data-id=${fixture.id} @click=${this.#setFixtureDetails}>Update</button>
        <button data-id=${fixture.id} @click=${this.#setPlacement}>Set Placement</button>
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
        <summary>Fixtures</summary>

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
        <div class="fixture-edit-row">
          <label for="height">Height</label>
          <input id="height" name="height" type="text" .value=${(this.fixture?.height ?? 0).toString()} />
        </div>
        <div class="fixture-edit-row">
          <label for="width">Width</label>
          <input id="width" name="width" type="text" .value=${(this.fixture?.width ?? 0).toString()} />
        </div>
        <button @click=${this.#updateFixture}>${this.fixtureIndex !== undefined ? 'Update' : 'Create'}</button>
      </dialog>
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

    strong {
      min-width: 10vw;
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-fixtures': Fixtures
  }
}