import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hlm-size-input')
export default class SizeInput extends LitElement {
  @property({ type: Number }) height = 53;
  @property({ type: Number }) width = 84.5;
  @property({ type: String }) unit = '';

  #emitChange() {
    const event = new CustomEvent('resize', {
        detail: [this.width, this.height],
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
  }

  #onWidthChange(event) {
    this.width = parseFloat(event.currentTarget.value);
    this.#emitChange();
  }

  #onHeightChange(event) {
    this.height = parseFloat(event.currentTarget.value);
    this.#emitChange();
  }

  render() {
    return html`
        <h3><slot></slot></h3>

        <div class="size-inputs">
            <div class="input">
                <label for="width">Width</label>
                <div class="input-container">
                    <input name="width" type="number" @change=${this.#onWidthChange} value=${this.width} />
                </div>
            </div>
            <div class="input">
                <label for="height">Height</label>
                <div class="input-container">
                    <input name="height" type="number" @change=${this.#onHeightChange} value=${this.height} />
                </div>
            </div>
        </div>
    `;
  }

  static styles = css`
    h3 {
      margin: 0.5rem 0;
    }

    .size-inputs {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      max-width: 50%;
    }

    .input {
      flex: 1 0 auto;
    }

    .input-container {
      display: inline-block;
      position: relative;
    }

    .input-container::after {
      position: absolute;
      top: 1px;
      right: 0.5rem;
    }

    .input-container:hover::after,
    .input-container:focus-within::after {
      right: 1.5rem;
    }

    @supports (-moz-appearance:none) {
      .input-container::after {
        right: 1.5rem;
      }
    }

    .input-container::after {
      content: ${unsafeCSS(this.unit)};
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-size-input': SizeInput
  }
}