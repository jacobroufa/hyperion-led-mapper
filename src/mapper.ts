import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import HLMElement from './element';
import HLMStorage from './storage';

import type Display from './display';
import type { Fixture, HLMKey } from './types';

@customElement('hyperion-led-mapper')
export default class Mapper extends HLMElement {
  @property({ type: Array }) fixtures: Fixture[] = [];
  @property({ type: Number }) fixturePlacementId: number = -1;

  @query('hlm-display') display?: Display;

  #setFixturePlacementId(event: CustomEvent<{ index: number }>) {
    this.fixturePlacementId = event.detail.index;
  }

  #updateFixtures() {
    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey);
  }

  #updateMap(event: CustomEvent<HLMKey>) {
    this.activeMapKey = event.detail;
  }

  render() {
    return html`
      <hlm-maps @hlm-event-map-change=${this.#updateMap}></hlm-maps>
      <hlm-fixtures
        .activeMapKey=${this.activeMapKey}
        @hlm-event-fixture-update=${this.#updateFixtures}
        @hlm-event-fixture-placement=${this.#setFixturePlacementId}>
      </hlm-fixtures>
      <hlm-display
        .activeMapKey=${this.activeMapKey}
        .fixtures=${this.fixtures}
        .fixtureId=${this.fixturePlacementId}>
      </hlm-display>
    `;
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'hyperion-led-mapper': Mapper
  }
}