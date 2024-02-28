import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import HLMElement from "./element";
import { HLMCanvasClickEvent } from "./types";

@customElement('hlm-canvas')
export default class HLMCanvas extends HLMElement {
  @property({ type: Number }) height = 0;
  @property({ type: Number }) width = 0;

  @query('.canvas') canvas?: HTMLDivElement;

  #mouseClick(event: MouseEvent) {
    const { offsetWidth: width, offsetHeight: height } = this.canvas!;
    const { left, top } = this.canvas!.getBoundingClientRect();
    let hscan = this._float((event.x - left) / width);
    let vscan = this._float((event.y - top) / height);

    if (hscan < 0) hscan = 0;
    if (vscan < 0) vscan = 0;

    this.emit<HLMCanvasClickEvent>('hlm-event-canvas-click', [this._float(vscan), this._float(hscan)]);
  }

  render() {
    return html`
      <div class="canvas" @click=${this.#mouseClick}>
        <slot></slot>
      </div>
      <style>
        .canvas {
          height: ${this.height}px;
          width: ${this.width}px;
        }
      </style>
    `;
  }

  static styles = css`
    .canvas {
      background: #ddd8de;
      position: relative;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'hlm-canvas': HLMCanvas
  }
}