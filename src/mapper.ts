import { css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import HLMElement from './element';

import type Display from './display';
import type { Fixture, HLMKey } from './types';
import { HLMStorage } from '.';

@customElement('hyperion-led-mapper')
export default class Mapper extends HLMElement {
  @property({ type: Array }) fixtures: Fixture[] = [];

  @query('hlm-display') display?: Display;

  #updateFixtures() {
    this.fixtures = HLMStorage.retrieve('fixtures', this.activeMapKey);
  }

  #updateMap(event: CustomEvent<HLMKey>) {
    this.activeMapKey = event.detail;
  }

  render() {
    return html`
      <hlm-maps @hlm-event-map-change=${this.#updateMap}></hlm-maps>
      <hlm-fixtures .active-map-key=${this.activeMapKey} @hlm-event-fixture-update=${this.#updateFixtures}></hlm-fixtures>
      <hlm-display .active-map-key=${this.activeMapKey} .fixtures=${this.fixtures}></hlm-display>
    `;
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    'hyperion-led-mapper': Mapper
  }
}