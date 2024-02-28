import type { GlobalKeys } from "./types";

async function onFixtureUpdate(fixtureId: number) {
  const screen = document.body.querySelector('hlm-display');
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
      case 'fixture':
        target[key] = value;
        onFixtureUpdate(value);
        return true;

      default:
        return false;
    }
  }
});