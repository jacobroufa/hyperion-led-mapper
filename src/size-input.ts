import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hlm-size-input')
export default class SizeInput extends LitElement {
  @property({ type: Number }) height: number = 0;
  @property({ type: Number }) width: number = 0;
  @property({ type: String }) unit: string = 'px';
  @property({ type: String }) flexDirection: 'row' | 'column' = 'row';

  #emitChange() {
    const event = new CustomEvent<[number, number]>('resize', {
        detail: [this.width ?? 0, this.height ?? 0],
        bubbles: true,
        composed: true
    });
    this.dispatchEvent(event);
  }

  #onWidthChange(event: Event) {
    this.width = parseFloat((event.currentTarget as HTMLInputElement).value);
    this.#emitChange();
  }

  #onHeightChange(event: Event) {
    this.height = parseFloat((event.currentTarget as HTMLInputElement).value);
    this.#emitChange();
  }

  render() {
    return html`
      <strong><slot></slot></strong>

      <div class="size-inputs">
        <div class="input">
          <label for="width">Width</label>
          <div class="input-container">
            <input name="width" type="number" @change=${this.#onWidthChange} .value=${this.width.toString()} />
          </div>
        </div>
        <div class="input">
          <label for="height">Height</label>
          <div class="input-container">
            <input name="height" type="number" @change=${this.#onHeightChange} .value=${this.height.toString()} />
          </div>
        </div>
      </div>

      <style>
        .size-inputs {
          flex-direction: ${this.flexDirection};
        }

        .input-container::after {
          content: '${this.unit.trim()}';
        }
      </style>
    `;
  }

  static styles = css`
    strong {
      display: inline-block;
      margin: 0.5rem 0;
    }

    .size-inputs {
      display: flex;
      gap: 0.5rem;
    }

    .input {
      flex: 1 0 auto;
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
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
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-size-input': SizeInput
  }
}