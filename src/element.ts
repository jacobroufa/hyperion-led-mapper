import { LitElement } from "lit";
import { property } from "lit/decorators.js";

import { defaultKey } from "./default";

import type { HLMEventKey, HLMKey } from "./types";

export default class HLMElement extends LitElement {
  /* The activeMapKey provides the application and its components with a value to retrieve from localStorage. */
  @property({ reflect: true, attribute: 'active-map-key' }) activeMapKey: HLMKey = defaultKey;

  emit<T>(name: HLMEventKey, detail?: T, bubbles: boolean = true, composed: boolean = true) {
    this.dispatchEvent(new CustomEvent<any>(name, {
        detail,
        bubbles,
        composed
    }));
  }

  _float(value: number) {
    return parseFloat(value.toFixed(4));
  }
}