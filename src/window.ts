import type { HLMStorageKey } from "./types";

function onMapKeyUpdate(key: HLMStorageKey) {
  const screen = document.body.querySelector('hlm-screen');
  if (screen) {
    screen.activeMapKey = key;
  }
  const fixtures = document.body.querySelector('hlm-fixtures');
  if (fixtures) {
    fixtures.activeMapKey = key;
  }
}

type GlobalKeys = {
    hlm?: HLMStorageKey;
};

const _keys: GlobalKeys = {};
export const keyProxy = new Proxy(_keys, {
  set: function(target, key, value) {
    const newValue = value.trim();
    if (key === 'hlm') {
      target[key] = newValue;
      onMapKeyUpdate(newValue);
    }
    return true;
  }
});