import { css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import './size-input.ts';

import HLMCanvas from './canvas.ts';
import HLMElement from './element';
import HLMStorage from './storage';
import watch from './watch.ts';

import type { Fixture, HLMCanvasClickEvent } from './types';

@customElement('hlm-fixtures')
export default class Fixtures extends HLMElement {
  @state() fixtures: Array<Fixture> = [];
  @state() fixture?: Fixture;
  @state() fixtureIndex: number = -1;
  @state() fixturePlacementIndex: number = -1;
  @state() _calculatedHeight: number = 0;
  @state() _calculatedWidth: number = 0;

  @query('details') fixtureList?: HTMLDetailsElement;
  @query('#fixture') fixtureModal?: HTMLDialogElement;
  @query('#name') fixtureName?: HTMLInputElement;
  @query('hlm-canvas') fixtureCanvas?: HLMCanvas;

  constructor() {
    super();
    this.setLocalProps();
  }

  @watch('activeMapKey')
  setLocalProps() {
    if (!this.activeMapKey) return;

    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey) ?? [];

    if (this.fixtureList) {
      this.fixtureList.open = !!this.fixtures.length;
    }
  }

  #setFixtureDetails(event: MouseEvent) {
    // ensure we have the latest fixtures so we don't break layout
    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey) ?? [];

    const id = (event.target as HTMLButtonElement).dataset.id;
    const maxFixtureId = this.fixtures.map(f => f.id).reduce((bigId, currentId) => (bigId > currentId) ? bigId : currentId, -1);

    if (id === 'create') {
      this.fixtureIndex = maxFixtureId + 1;
      this.fixture = {
        id: this.fixtureIndex,
        name: '',
        height: 0,
        width: 0,
        coords: [0, 0]
      };
    } else {
      const numId = parseInt(id ?? '', 10);
      this.fixtureIndex = numId;
      this.fixture = this.fixtures.find(f => f.id === numId);
    }

    this.fixtureModal!.showModal();

    this.#setCanvasSize();
  }

  #setFixtureToPlace(event: MouseEvent) {
    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);
    const placementId = this.fixturePlacementIndex === id ? -1 : id;

    this.fixture = (placementId === -1) ? undefined : this.fixtures.find(f => f.id === id);

    this.#updatePlacementIndex(placementId);
  }

  #updatePlacementIndex(index: number) {
    this.fixturePlacementIndex = index;
    this.emit<{ index: number }>('hlm-event-fixture-placement', { index })
  }

  #removeFixture(event: MouseEvent) {
    // ensure we have the latest fixtures so we don't break layout
    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey) ?? [];

    const id = parseInt((event.target as HTMLButtonElement).dataset.id ?? '', 10);

    this.fixtures = this.fixtures.filter(fixture => fixture.id !== id);

    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);

    this.emit<never>('hlm-event-fixture-update');
  }

  #updateFixtureDimensions(event: CustomEvent<[number, number]>) {
    const [width, height] = event.detail;
    const fix = this.fixture!;
    fix.height = height;
    fix.width = width;

    this.fixture = fix;

    this.#setCanvasSize();
    this.#updateFixture();
  }

  #setCanvasSize() {
    if (!this.fixtureCanvas) return;

    const multiplier = this.fixture!.height / this.fixture!.width;
    this._calculatedHeight = multiplier * this.fixtureCanvas!.offsetWidth;
    this._calculatedWidth = this.fixtureCanvas!.offsetWidth;
  }

  #setFixtureLed(event: CustomEvent<HLMCanvasClickEvent>) {
    // const { offsetLeft, offsetTop, offsetWidth: width, offsetHeight: height } = this.fixtureCanvas!;
    // console.log(this.fixtureCanvas, offsetLeft, width, offsetTop, height)
    // // const left = width - offsetLeft;
    // // const top = height - offsetTop;
    // const hscan = this._float(event.x / width);
    // const vscan = this._float(event.y / height);

    // console.log(event.x, event.y, hscan, vscan, width, height)

    // let led: LedLayout = {
    //   hmax: this._float(hscan + 0.005),
    //   hmin: this._float(hscan - 0.005),
    //   vmax: this._float(vscan + 0.005),
    //   vmin: this._float(vscan - 0.005)
    // };

    // (Object.keys(led) as Array<LedLayoutKey>).forEach(key => {
    //   if (led[key] < 0) led[key] = 0;
    //   if (led[key] > 1) led[key] = 1;
    // });

    console.log(this.tagName, 'fixture led values', event.detail);
  }

  #updateFixtureName() {
    const fix = this.fixture!;
    fix.name = this.fixtureName!.value;

    this.fixture = fix;

    this.#updateFixture();
  }

  #updateFixture() {
    const fixtures = [...this.fixtures];
    const index = fixtures.findIndex(f => f.id === this.fixtureIndex);
    console.log(index);

    if (index === -1) {
      fixtures.push(this.fixture!);

      // creating a new fixture, allow it to be placed immediately
      this.#updatePlacementIndex(this.fixtureIndex);
    } else {
      fixtures.splice(index, 1, this.fixture!);
    }

    this.fixtures = fixtures;

    this.requestUpdate();

    HLMStorage.store('fixtures', fixtures, this.activeMapKey);

    this.emit('hlm-event-fixture-update');
  }

  #renderFixture(fixture: Fixture) {
    const currentIndex = fixture.id === this.fixturePlacementIndex;
    const name = `${currentIndex ? '** ' : ''}${fixture.name}${currentIndex ? ' **' : ''}`;
    const place = currentIndex ? 'Finish' : 'Set';
    return html`
      <li class="fixture-row">
        <span><strong>${name}</strong> ${fixture?.width}" x ${fixture?.height}"</span>
        <button data-id=${fixture.id} @click=${this.#setFixtureDetails}>Update</button>
        <button data-id=${fixture.id} @click=${this.#setFixtureToPlace}>${place} Placement</button>
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
          <input id="name" name="name" type="text" .value=${this.fixture?.name ?? ''} @change=${this.#updateFixtureName} />
        </div>

        <hlm-size-input 
          class="fixture-edit-input"
          .height=${(this.fixture?.height ?? 0)}
          .width=${this.fixture?.width ?? 0}
          unit="in"
          flex="column"
          @hlm-event-resize=${this.#updateFixtureDimensions}>
          Dimensions
        </hlm-size-input>

        <div class="fixture-canvas">
          <strong>Fixture Layout</strong>
          <hlm-canvas
            .height=${this._calculatedHeight}
            .width=${this._calculatedWidth}
            @hlm-event-canvas-click=${this.#setFixtureLed}
          ></hlm-canvas>
        </div>

        <button @click=${() => this.fixtureModal!.close()}>${this.fixtureIndex !== undefined ? 'Update' : 'Create'}</button>
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

    hlm-canvas {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-fixtures': Fixtures
  }
}