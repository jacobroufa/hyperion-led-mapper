import { css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { SVG } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.topath.js';

import './size-input.ts';
import './svg.shapes.js';

import HLMCanvas from './canvas.ts';
import HLMElement from './element';
import HLMStorage from './storage';
import watch from './watch.ts';

import type { Fixture, FixtureShape, HLMCanvasClickEvent } from './types';
import { Point } from '@svgdotjs/svg.js';
import { PointArray } from '@svgdotjs/svg.js';

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
  @query('#shape-select') fixtureShape?: HTMLSelectElement;
  @query('#poly-select') fixtureVertices?: HTMLSelectElement;
  @query('#shape-upload') fixtureSVGUpload?: HTMLInputElement;
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
  }

  #setCanvasSize() {
    if (!this.fixtureCanvas) return;

    const multiplier = this.fixture!.height / this.fixture!.width;
    this._calculatedHeight = multiplier * this.fixtureCanvas!.offsetWidth;
    this._calculatedWidth = this.fixtureCanvas!.offsetWidth;

    this.#updateFixture(true);
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

  #unsetFixtureShape() {
    const fix = this.fixture!;
    fix.shape = undefined;

    this.fixture = fix;

    this.#updateFixture();
  }

  #updateFixtureShape() {
    const fix = this.fixture!;
    fix.shape = this.fixtureShape!.value as FixtureShape;

    this.fixture = fix;

    this.#updateFixture(true);
  }

  #updateFixtureVertices() {
    const fix = this.fixture!;
    fix.vertices = parseInt(this.fixtureVertices!.value, 10);

    this.fixture = fix;

    this.#updateFixture(true);
  }

  // TODO: implement SVG upload
  #uploadShape() {
    alert('uploading shape... see console for details...');
    console.log(this.fixtureSVGUpload?.files);
  }

  #updateFixture(drawSvg = false) {
    const fixtures = [...this.fixtures];
    const index = fixtures.findIndex(f => f.id === this.fixtureIndex);

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

    if (drawSvg) {
      const canvas = this.fixtureCanvas?.querySelector('svg');
      const drawing = canvas ? SVG(canvas).clear() : SVG().addTo(this.fixtureCanvas!);

      // ensure we are appropriately sized for the new fixture, should it change
      drawing.size(this._calculatedWidth, this._calculatedHeight);

      const strokeWidth = 2;
      const available = Math.min(this._calculatedWidth, this._calculatedHeight) / 2;
      let shape;

      switch (this.fixture?.shape) {
        case 'square':
          shape = drawing.rect(this._calculatedWidth - (strokeWidth * 2), this._calculatedHeight - (strokeWidth * 2))
            .toPath().fill('none').stroke({ color: '#222', width: strokeWidth }).move(strokeWidth, strokeWidth);
          break;
        case 'circle':
          shape = drawing.ellipse(this._calculatedWidth - (strokeWidth * 2), this._calculatedHeight - (strokeWidth * 2))
            .toPath().fill('none').stroke({ color: '#222', width: strokeWidth }).move(strokeWidth, strokeWidth);
          break;
        case 'star':
          shape = drawing.polygon().star({ outer: available, inner: available * 0.4, spikes: this.fixture.vertices })
            .toPath().fill('none').stroke({ color: '#222', width: strokeWidth }).move(strokeWidth, strokeWidth);
          break;
        case 'poly':
          shape = drawing.polygon().ngon({ radius: available, edges: this.fixture.vertices })
            .toPath().fill('none').stroke({ color: '#222', width: strokeWidth }).move(strokeWidth, strokeWidth);
          break;
        case undefined:
        default:
          break;
      }

      const len = shape.length()
      let arr: Array<any> | PointArray = new PointArray([]);
      for (let i = 0; i < len; i += (len / 31)) {
        let r = drawing.rect(5, 5)
        let p = new Point(shape.pointAt(i))
        r.move(p.x - 2.5, p.y - 2.5)
        arr.push(p.toArray())
      }

      arr = arr.map(([x, y]) => ({
        hmin: x - 2.5,
        hmax: x + 2.5,
        vmin: y - 2.5,
        vmax: y + 2.5
      })).map(led => ({
        hmin: led.hmin < 0 ? 0 : led.hmin,
        hmax: led.hmin < 0 ? led.hmax + led.hmin : led.hmax,
        vmin: led.vmin < 0 ? 0 : led.vmin,
        vmax: led.vmin < 0 ? led.vmax + led.vmin : led.vmax
      }));

      console.log(arr)
    }
  }

  #renderFixtureRow(fixture: Fixture) {
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
          ${this.fixtures.map(this.#renderFixtureRow.bind(this))}
          <li>
            <button data-id="create" @click=${this.#setFixtureDetails}>Add Fixture</button>
          </li>
        </ul>
      </details>

      <dialog id="fixture">
        <strong>Fixture Layout</strong>

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

        <div class="fixture-edit-input">
          <strong>Shape</strong>
          ${when(this.fixture?.shape !== 'custom', () => html`
            <div class="input">
              <label for="shape-select">Pick one:</label>
              <select .value=${this.fixture?.shape as string} name="shape-select" id="shape-select" @change=${this.#updateFixtureShape}>
                <option>---------</option>
                <option value="square" .selected=${this.fixture?.shape === 'square'}>Rectangle</option>
                <option value="circle" .selected=${this.fixture?.shape === 'circle'}>Ellipse</option>
                <option value="star" .selected=${this.fixture?.shape === 'star'}>Star</option>
                <option value="poly" .selected=${this.fixture?.shape === 'poly'}>Polygon</option>
                <option value="blob" .selected=${this.fixture?.shape === 'blob'}>Blob</option>
                <option value="custom" .selected=${this.fixture?.shape === 'custom'}>Custom</option>
              </select>
            </div>
            <div class="help">Note, rectangle and ellipse shapes will conform to a square or circle if height and width are equal.</div>
          `, () => html`
            <div class="input">
              <label for="shape-upload">Upload SVG:</label>
              <input type="file" name="shape-upload" id="shape-upload" accept="image/svg+xml" />
            </div>
            <div class="input">
              <button @click=${this.#unsetFixtureShape}>Select pre-defined shape</button>
              <button @click=${this.#uploadShape}>Upload custom shape</button>
            </div>
          `)}
          ${when(this.fixture?.shape === 'star' || this.fixture?.shape === 'poly', () => html`
            <div class="input">
              <label for="poly-select">Number of vertices:</label>
              <input type="number" .value=${this.fixture?.vertices?.toString() || ''} name="poly-select" id="poly-select" @change=${this.#updateFixtureVertices} />
            </div>
          `)}
        </div>

        <div class="fixture-canvas">
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

    dialog strong {
      align-self: flex-start;
      display: inline-block;
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

    .fixture-edit-input strong {
      display: inline-block;
      margin: 0.5rem 0;
    }

    .fixture-edit-input .input {
      display: flex;
      gap: 0.5rem;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .fixture-edit-input .help {
      font-size: 85%;
      margin-bottom: 0.5rem;
      max-width: 300px;
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