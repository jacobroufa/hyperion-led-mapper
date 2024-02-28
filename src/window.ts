import type { HLMStorageKey } from "./types";

async function onMapKeyUpdate(key: HLMStorageKey) {
  const screen = document.body.querySelector('hlm-screen');
  if (screen) {
    await screen.updateComplete;
    screen.activeMapKey = key;
  }
  const fixtures = document.body.querySelector('hlm-fixtures');
  if (fixtures) {
    await fixtures.updateComplete;
    fixtures.activeMapKey = key;
  }
}

type GlobalKeys = {
    hlm?: HLMStorageKey;
};

const _keys: GlobalKeys = {};
export const keyProxy = new Proxy(_keys, {
  set: function(target, key, value) {
    const newValue = value?.trim();
    if (key === 'hlm') {
      target[key] = newValue;
      onMapKeyUpdate(newValue ?? 'hlm-null');
    }
    return true;
  }
});