import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { ratioMultiplier } from './default';
import HLMElement from './element';

import type { AspectRatio } from './types';

@customElement('hlm-ratio-input')
export default class RatioInput extends HLMElement {
  @property({ type: String, attribute: 'aspect-ratio', reflect: true }) aspectRatio: AspectRatio = '1:1';
  @property({ type: Number, attribute: 'aspect-multiplier', reflect: true }) aspectMultiplier: number = 1;

  #onRatioChange(event: Event) {
    if (!event.currentTarget) return;

    const select = event.currentTarget as HTMLSelectElement;
    const options = select.options;

    this.aspectMultiplier = parseFloat(select.value);
    this.aspectRatio = options[options.selectedIndex].textContent as AspectRatio;

    this.emit('hlm-event-ratio-change', [this.aspectMultiplier, this.aspectRatio]);
  }

  #renderOption(key: AspectRatio) {
    const value = ratioMultiplier[key as AspectRatio];
    const active = this.aspectMultiplier === value;

    return html`<option .value="${value.toString()}" ?selected=${active}>${key}</option>`
  }

  render() {
    const ratios = Object.keys(ratioMultiplier) as Array<AspectRatio>;

    return html`
        <strong>Aspect Ratio</strong>

        <div class="input">
          <select name="ratio" @change=${this.#onRatioChange} .value=${this.aspectMultiplier.toString()}>
            ${ratios.map(this.#renderOption.bind(this))}
          </select>
        </div>
    `;
  }

  static styles = css`
    strong {
      display: inline-block;
      margin: 0.5rem 0;
    }

    .input {
      max-width: 50%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-ratio-input': RatioInput
  }
}