import { css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import './ratio-input.ts';
import './size-input.ts';

import HLMElement from './element.ts';
import HLMStorage from './storage.ts';

import type { AspectRatio, Fixture } from './types.ts';

/**
 * TODO / Bugs:
 * - when adding a fixture undefined _fixtureHeights throws an error in renderFixture
 * - adding/updating/removing fixture doesn't re-render properly automatically
 */

@customElement('hlm-display')
export default class Display extends HLMElement {
  @property({ type: Number, attribute: 'fixture-id', reflect: true }) fixtureId: number = -1;

  @property({ type: Number }) height = 0;
  @property({ type: Number }) width = 0;
  @property({ type: Number }) aspectMultiplier = 0;
  @property({ type: String }) aspectRatio: AspectRatio = '16:10';
  @property({ type: Array }) fixtures: Fixture[] = []

  /* height of the displayed "screen" */
  @state() _calculatedHeight = 0;
  /* height of the fixtures based upon _calculatedHeight */
  @state() _fixtureHeights: { [key: number]: [number, number] } = {};
  /* active fixture having placement adjusted */
  @state() _fixture?: Fixture;

  @query('.screen') screenDiv?: HTMLDivElement;

  constructor() {
    super();
    this.#setLocalProps();
  }

  updated(_changedProperties: Map<keyof Display, Display[keyof Display]>): void {
    const key = _changedProperties.get('activeMapKey');
    if (_changedProperties.has('activeMapKey') && key !== this.activeMapKey) {
      this.#setLocalProps();
    }

    const fixtureId = _changedProperties.get('fixtureId');
    if (_changedProperties.has('fixtureId') && fixtureId !== this.fixtureId) {
      this._fixture = this.fixtures.find(f => f.id === this.fixtureId);
    }

    if (_changedProperties.has('fixtures')) {
      this.#setFixtures();
    }
  }

  #setLocalProps() {
    if (!this.activeMapKey) return;

    this.height = HLMStorage.retrieve('height', this.activeMapKey) ?? 0;
    this.width = HLMStorage.retrieve('width', this.activeMapKey) ?? 0;
    this.aspectMultiplier = HLMStorage.retrieve('aspectMultiplier', this.activeMapKey) ?? 0;
    this.aspectRatio = HLMStorage.retrieve('aspectRatio', this.activeMapKey) ?? '1:1';
    this.fixtures = HLMStorage.retrieve<Fixture[]>('fixtures', this.activeMapKey) ?? [];

    this.#setScreenSize();
  }

  #setFixtures() {
    if (this.fixtureId > -1) {
      this._fixture = this.fixtures.find(f => f.id === this.fixtureId);
    }

    this.#setFixtureHeights();
  }

  #mouseClick(event: MouseEvent) {
    if (!this._fixture) return;

    const { offsetLeft, offsetTop, offsetWidth: width, offsetHeight: height } = this.screenDiv!;
    const hscan = this._float((event.x - offsetLeft) / width);
    const vscan = this._float((event.y - offsetTop) / height);
    const fixWidth = (this._fixture?.width ?? 0) / this.width;
    const fixHeight = (this._fixture?.height ?? 0) / this.height;
    let left = hscan - (fixWidth / 2);
    let top = vscan - (fixHeight / 2);

    if (left < 0) left = 0;
    if (top < 0) top = 0;
    if (left + fixWidth > 1) left = (1 - fixWidth);
    if (top + fixHeight > 1) top = (1 - fixHeight);

    this._fixture!.coords = [this._float(top), this._float(left)];

    const fixId = this.fixtures.findIndex(f => f.id === this.fixtureId);

    this.fixtures.splice(fixId, 1, this._fixture);

    HLMStorage.store('fixtures', this.fixtures, this.activeMapKey);
  }

  #setScreenSize() {
    if (!this.screenDiv) return;

    const h = this.aspectMultiplier * this.screenDiv!.offsetWidth;
    this._calculatedHeight = h;

    this.#setFixtureHeights();
  }

  #setFixtureHeights() {
    this.fixtures.forEach(fixture => {
      const relativeFixtureHeight = (fixture?.height ?? 0) / this.height;
      const displayHeight = parseInt((relativeFixtureHeight * this._calculatedHeight).toFixed(), 10);
      const displayTop = this._calculatedHeight * fixture.coords[0];
      this._fixtureHeights[fixture.id] = [displayHeight, displayTop];
    });

    this.requestUpdate();
  }

  #setDimensions(event: CustomEvent<[number, number]>) {
    const [width, height] = event.detail;
    this.height = height;
    this.width = width;

    if (!this.activeMapKey) return;

    HLMStorage.store('height', height, this.activeMapKey);
    HLMStorage.store('width', width, this.activeMapKey);
  }

  #setAspectRatio(event: CustomEvent<[number, AspectRatio]>) {
    const [multiplier, ratio] = event.detail;
    this.aspectMultiplier = multiplier;
    this.aspectRatio = ratio;
    this.#setScreenSize();

    if (!this.activeMapKey) return;

    HLMStorage.store('aspectMultiplier', multiplier, this.activeMapKey);
    HLMStorage.store('aspectRatio', ratio, this.activeMapKey);
  }

  renderFixture(fixture: Fixture) {
    if (!fixture) return;

    const { offsetWidth: width } = this.screenDiv!;
    const relativeFixtureWidth = (fixture?.width ?? 0) / this.width;
    const fixWidth = parseInt((relativeFixtureWidth * width).toFixed(), 10);
    const [fixHeight, top] = this._fixtureHeights[fixture.id];
    const left = width * fixture.coords[1];

    return html`
      <div
        class=${classMap({
          fixture: true,
          active: fixture.id === this.fixtureId
        })}
        style="height: ${fixHeight}px; width: ${fixWidth}px; top: ${top}px; left: ${left}px">
        ${fixture.name}
      </div>
    `;
  }

  render() {
    if (this.activeMapKey === 'hlm-null') {
        return;
    }

    return html`
      <details>
        <summary>
          <div>
            <span>Screen Size:</span>
            <span>${this.width}" x ${this.height}"</span>
            <span>(${this.aspectRatio})</span>
          </div>
        </summary>

        <div class="input-container">
          <hlm-size-input
            height=${this.height}
            width=${this.width}
            unit="in"
            @hlm-event-resize=${this.#setDimensions}>
            Physical Dimensions
          </hlm-size-input>
          <hlm-ratio-input
            aspect-multiplier=${this.aspectMultiplier}
            aspect-ratio=${this.aspectRatio}
            @hlm-event-ratio-change=${this.#setAspectRatio}>
          </hlm-ratio-input>
        </div>
      </details>

      <hr />

      <div class="screen" @click=${this.#mouseClick}>
        ${this.fixtures.map(this.renderFixture.bind(this))}
      </div>

      <style>
        .screen {
          height: ${this._calculatedHeight}px;
        }
      </style>
    `;
  }

  static styles = css`
    details {
      margin: 0.5rem 0;
    }

    summary > div {
      display: inline-flex;
      gap: 0.5rem;
    }

    .input-container {
      display: flex;
      gap: 2rem;
      margin: 0 0.5rem;
    }

    .input-container > hlm-ratio-input,
    .input-container > hlm-size-input {
      flex: 0 1 auto;
    }

    .screen {
      background: #ddd8de;
      position: relative;
      width: 100%;
    }

    .screen .fixture {
      background: #cad7d2;
      box-shadow: inset 0 0 0 1px var(--dark-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      position: absolute;
    }

    .screen .fixture.active {
      box-shadow: inset 0 0 3px 1px var(--dark-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-display': Display
  }
}