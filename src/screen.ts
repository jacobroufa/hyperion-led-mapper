import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import SizeInput from './size-input.ts';

@customElement('hlm-screen')
export default class Screen extends LitElement {
  @property({ type: Number }) dHeight = 53;
  @property({ type: Number }) dWidth = 84.5;
  @property({ type: Number }) rHeight = 800;
  @property({ type: Number }) rWidth = 1200;

  @state({ type: Number }) _calculatedHeight = 0;

  @query('.screen') screenDiv;

  firstUpdated() {
    this.#setScreenSize();
  }

  #setScreenSize() {
    const h = ((this.dHeight / this.dWidth) * this.screenDiv.offsetWidth).toFixed();
    this._calculatedHeight = h;
  }

  #setDimensions(event) {
    const [width, height] = event.detail;
    this.dHeight = height;
    this.dWidth = width;
    console.log(width, height)
    this.#setScreenSize();
  }


  #setResolution(event) {
    const [width, height] = event.detail;
    this.rHeight = height;
    this.rWidth = width;
  }

  render() {
    return html`
      <details>
        <summary>
          <div>
            <span>Screen Size</span>
            <span>${this.rWidth}x${this.rHeight}</span>
            <span>${this.dWidth}" x ${this.dHeight}"</span>
          </div>
        </summary>

        <div class="input-container">
          <hlm-size-input height=${this.dHeight} width=${this.dWidth} unit="in" @resize=${this.#setDimensions}>
            Physical Dimensions
          </hlm-size-input>
          <hlm-size-input height=${this.rHeight} width=${this.rWidth} unit="px" @resize=${this.#setResolution}>
            Screen Resolution
          </hlm-size-input>
        </div>
      </details>

      <hr />

      <div class="screen" style="height: ${this._calculatedHeight}px">
      </div>
    `;
  }

  static styles = css`
    summary > div {
      display: inline-flex;
      justify-content: space-between;
      width: 97%;
    }

    .input-container {
      display: flex;
      gap: 1rem;
    }

    .input-container > hlm-size-input {
      flex: 1 0 auto;
    }

    .screen {
      background: #cac2cf;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: 500;
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-screen': Screen
  }
}