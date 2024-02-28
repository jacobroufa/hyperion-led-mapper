import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import HLMStorage from './storage';

import type { Fixture, HLMStorageKey } from './types';

@customElement('hlm-fixtures')
export default class Fixtures extends LitElement {
  @property({ type: String, attribute: 'active-map-key', reflect: true }) activeMapKey?: HLMStorageKey;

  @state() fixtures: Array<Fixture> = [];
  @state() fixture?: Fixture;

  @query('#fixture') fixtureModal?: HTMLDialogElement;

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
    const id = (event.target as HTMLButtonElement).dataset['id'];

    if (id === 'create') {

    }
  }

  #renderFixture(fixture: Fixture) {
    return html`
      <button data-id=${fixture.id} @click=${this.#setFixtureDetails}>${fixture.name}</button>
    `;
  }

  render() {
    return html`
      <details>
        <summary>Fixtures</summary>

        <div class="fixture-container">
          ${this.fixtures.map(this.#renderFixture.bind(this))}
          <button data-id="create" @click=${this.#setFixtureDetails}>Add Fixture</button>
        </div>
      </details>

      <dialog id="fixture">

      </dialog>
    `;
  }

  static styles = css`
    details {
      margin: 0.5rem 0;
    }

    .fixture-container {
      display: flex;
      margin: 0 0.5rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-fixtures': Fixtures
  }
}