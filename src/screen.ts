import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import './ratio-input.ts';
import './size-input.ts';

import type { AspectRatio } from './ratio-input.ts';

type LedLayoutKey = 'hmax' | 'hmin' | 'vmax' | 'vmin';
type LedLayout = { [k in LedLayoutKey]: number };

@customElement('hlm-screen')
export default class Screen extends LitElement {
  @property({ type: Number }) height = 53;
  @property({ type: Number }) width = 84.5;
  @property({ type: Number }) aspectMultiplier = 0.75;
  @property({ type: String }) aspectRatio: AspectRatio = '4:3';

  @state() _calculatedHeight = 0;

  @query('.screen') screenDiv?: HTMLDivElement;

  firstUpdated() {
    this.#setScreenSize();
  }

  #mouseClick(event: MouseEvent) {
    const { offsetLeft, offsetTop, offsetWidth: width, offsetHeight: height } = this.screenDiv!;
    const hscan = parseFloat(((event.x - offsetLeft) / width).toFixed(4));
    const vscan = parseFloat(((event.y - offsetTop) / height).toFixed(4));

    let led: LedLayout = {
      hmax: parseFloat((hscan + 0.005).toFixed(4)),
      hmin: parseFloat((hscan - 0.005).toFixed(4)),
      vmax: parseFloat((vscan + 0.005).toFixed(4)),
      vmin: parseFloat((vscan - 0.005).toFixed(4))
    };

    (Object.keys(led) as Array<LedLayoutKey>).forEach(key => {
      if (led[key] < 0) led[key] = 0;
      if (led[key] > 1) led[key] = 1;
    });

    console.log(led);
    // TODO: do something with this... define LED fixture?
  }

  #setScreenSize() {
    const h = this.aspectMultiplier * this.screenDiv!.offsetWidth;
    this._calculatedHeight = h;
  }

  #setDimensions(event: CustomEvent<[number, number]>) {
    const [width, height] = event.detail;
    this.height = height;
    this.width = width;
  }

  #setAspectRatio(event: CustomEvent<[number, AspectRatio]>) {
    const [multiplier, ratio] = event.detail;
    this.aspectMultiplier = multiplier;
    this.aspectRatio = ratio;
    this.#setScreenSize();
  }

  render() {
    return html`
      <details>
        <summary>
          <div>
            <span>Screen Size</span>
            <span>${this.aspectRatio}</span>
            <span>${this.width}" x ${this.height}"</span>
          </div>
        </summary>

        <div class="input-container">
          <hlm-size-input height=${this.height} width=${this.width} unit="in" @resize=${this.#setDimensions}>
            Physical Dimensions
          </hlm-size-input>
          <hlm-ratio-input aspectMultiplier=${this.aspectMultiplier} aspectRatio=${this.aspectRatio} @ratiochange=${this.#setAspectRatio}>
          </hlm-ratio-input>
        </div>
      </details>

      <hr />

      <div class="screen" style="height: ${this._calculatedHeight}px" @click=${this.#mouseClick}>
      </div>
    `;
  }

  static styles = css`
    details {
      margin: 0.5rem 0;
    }

    summary > div {
      display: inline-flex;
      gap: 1rem;
    }

    .input-container {
      display: flex;
      gap: 1rem;
      margin: 0 0.5rem;
    }

    .input-container > hlm-ratio-input,
    .input-container > hlm-size-input {
      flex: 0 1 auto;
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