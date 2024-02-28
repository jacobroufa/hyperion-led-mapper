import HLMStorage from "./storage";
import type { GlobalKeys, HLMStorageKey } from "./types";

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

async function onFixtureUpdate(fixtureId: number) {
  const screen = document.body.querySelector('hlm-screen');
  if (screen) {
    await screen.updateComplete;
    screen.fixtureId = fixtureId;
  }
}

/* TODO: Replace this Proxy object with events that can be typed properly */
const _keys: GlobalKeys = {};
export const keyProxy = new Proxy(_keys, {
  set: function(target, key, value) {
    switch (key) {
      case 'hlm':
        // This value comes from HTML dataset and so will always be a string
        const newValue = value?.trim();
        target[key] = newValue;
        onMapKeyUpdate(newValue ?? 'hlm-null');
        return true;

      case 'fixture':
        target[key] = value;
        onFixtureUpdate(value);
        return true;

      default:
        return false;
    }
  }
});

const fix = document.body.querySelector('hlm-fixtures');
const screen = document.body.querySelector('hlm-screen');

document.body.addEventListener('hlm-fixture-update', () => {
  if (screen) {
    screen.fixtures = HLMStorage.retrieve('fixtures', screen.activeMapKey);
  }
  if (fix) {
    fix.fixtures = HLMStorage.retrieve('fixtures', fix.activeMapKey);
  }
});