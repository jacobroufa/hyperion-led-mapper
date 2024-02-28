import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import type { AspectRatio } from './types';

export const ratioMultiplier: { [k in AspectRatio]: number } = {
  '1:1': 1,
  '4:3': 0.75,
  '16:10': 0.625,
  '16:9': 0.5625
}

@customElement('hlm-ratio-input')
export default class RatioInput extends LitElement {
  @property({ type: String }) aspectRatio: AspectRatio = '1:1';
  @property({ type: Number }) aspectMultiplier: number = 1;

  #emitChange() {
    const event = new CustomEvent<[number, AspectRatio]>('ratiochange', {
        detail: [this.aspectMultiplier, this.aspectRatio!],
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
  }

  #onRatioChange(event: Event) {
    if (!event.currentTarget) return;
    const select = event.currentTarget as HTMLSelectElement;
    const options = select.options;
    this.aspectMultiplier = parseFloat(select.value);
    this.aspectRatio = options[options.selectedIndex].textContent as AspectRatio;
    this.#emitChange();
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