import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hlm-fixtures')
export default class Fixtures extends LitElement {
  @property({ type: Number }) height = 53;
  @property({ type: Number }) width = 84.5;

  #setDimensions(event: CustomEvent<[number, number]>) {
    const [width, height] = event.detail;
    this.height = height;
    this.width = width;
  }

  render() {
    return html`
      <details>
        <summary>Fixtures</summary>

        <div class="input-container">
          <hlm-size-input height=${this.height} width=${this.width} unit="px" @resize=${this.#setDimensions}>
            Fixture Dimensions
          </hlm-size-input>
        </div>
      </details>
    `;
  }

  static styles = css`
    details {
      margin: 0.5rem 0;
    }

    .input-container {
      margin: 0 0.5rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-fixtures': Fixtures
  }
}