import { HLMKey } from "./types";

export default class HLMStorage {
    static isKey(keyish: string | HLMKey): keyish is HLMKey {
        return (keyish as HLMKey).trim().startsWith('hlm-');
    }

    static get keys(): Array<HLMKey> {
        let keys: Array<HLMKey> = [];

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i) ?? '';
            if (HLMStorage.isKey(key)) {
                keys.push(key);
            }
        }

        return keys;
    }

    static remove(key: HLMKey): void {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    }

    static replace(item: any, key: HLMKey): void {
        localStorage.setItem(key, JSON.stringify(item));
    }

    static retrieve<K = any>(item: string, key: HLMKey): K {
        let currentValue = JSON.parse(localStorage.getItem(key) ?? '{}');
        return currentValue[item];
    }

    static store(item: string, value: any, key: HLMKey): void {
        let currentValue = JSON.parse(localStorage.getItem(key) ?? '{}');
        currentValue[item] = value;
        localStorage.setItem(key, JSON.stringify(currentValue));
    }
}