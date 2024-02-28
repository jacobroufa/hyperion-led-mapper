import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hlm-screen')
export default class Screen extends LitElement {
  @property({ type: Number }) dHeight = 53;
  @property({ type: Number }) dWidth = 84.5;
  @property({ type: Number }) rHeight = 800;
  @property({ type: Number }) rWidth = 1200;

  #onDWidthChange(event) {
    this.dWidth = parseFloat(event.currentTarget.value);
  }

  #onDHeightChange(event) {
    this.dHeight = parseFloat(event.currentTarget.value);
  }

  #onRWidthChange(event) {
    this.rWidth = parseFloat(event.currentTarget.value);
  }

  #onRHeightChange(event) {
    this.rHeight = parseFloat(event.currentTarget.value);
  }

  render() {
    return html`
      <details>
        <summary>Screen Size</summary>

        <div class="input-container">
          <div>
            <h3>Physical Dimensions</h3>

            <div class="size-inputs">
              <div class="input">
                <label for="dwidth">Width</label>
                <div class="physical">
                  <input name="dwidth" type="number" @change=${this.#onDWidthChange} value=${this.dWidth} />
                </div>
              </div>
              <div class="input">
                <label for="dheight">Height</label>
                <div class="physical">
                  <input name="dheight" type="number" @change=${this.#onDHeightChange} value=${this.dHeight} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3>Screen Resolution</h3>

            <div class="size-inputs">
              <div class="input">
                <label for="rwidth">Width</label>
                <div class="resolution">
                  <input name="rwidth" type="number" @change=${this.#onRWidthChange} value=${this.rWidth} />
                </div>
              </div>
              <div class="input">
                <label for="rheight">Height</label>
                <div class="resolution">
                  <input name="rheight" type="number" @change=${this.#onRHeightChange} value=${this.rHeight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </details>

      <hr />

      <style>
        .screen {
          height: ${this.rHeight}px;
          width: ${this.rWidth}px;
        }
      </style>
      <div class="screen">
        ${this.rWidth} X ${this.rHeight}
      </div>
    `;
  }

  static styles = css`
    .input-container {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }

    .input-container > div {
      flex: 1 0 auto;
    }

    .input-container > div > h3 {
      margin: 0.5rem 0;
    }

    .size-inputs {
      display: flex;
      flex-direction: row;
      gap: 0.5rem;
      max-width: 50%;
    }

    .physical, .resolution {
      display: inline-block;
      position: relative;
    }

    .physical::after,
    .resolution::after {
      position: absolute;
      top: 1px;
      right: 0.5rem;
    }

    .physical:hover::after,
    .physical:focus-within::after,
    .resolution:hover::after,
    .resolution:focus-within::after {
      right: 1.5rem;
    }

    @supports (-moz-appearance:none) {
      .physical::after,
      .resolution::after {
        right: 1.5rem;
      }
    }

    .physical::after {
      content: 'in';
    }

    .resolution::after {
      content: 'px';
    }

    .input {
      flex: 1 0 auto;
    }

    .screen {
      background: #cac2cf;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 500;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-screen': Screen
  }
}