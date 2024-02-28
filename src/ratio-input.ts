import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AspectRatio = '4:3' | '16:9' | '16:10';
export const ratioMultiplier: { [k in AspectRatio]: number } = {
  '4:3': 0.75,
  '16:10': 0.625,
  '16:9': 0.5625
}

@customElement('hlm-ratio-input')
export default class RatioInput extends LitElement {
  @property({ type: String }) aspectRatio: AspectRatio = '4:3';
  @property({ type: Number }) aspectMultiplier = ratioMultiplier['4:3'];

  #emitChange() {
    const event = new CustomEvent<[number, AspectRatio]>('ratiochange', {
        detail: [this.aspectMultiplier, this.aspectRatio],
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

  render() {
    return html`
        <strong>Aspect Ratio</strong>

        <div class="input">
          <select name="ratio" @change=${this.#onRatioChange} value=${this.aspectMultiplier}>
            ${Object.keys(ratioMultiplier).map(key => html`
              <option value="${ratioMultiplier[key as AspectRatio]}">${key}</option>
            `)}
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