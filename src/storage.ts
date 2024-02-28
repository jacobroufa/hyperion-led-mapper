export type HLMStorageKey = `hlm-${string}`;

export class HLMStorage {
    static isKey(keyish: string | HLMStorageKey): keyish is HLMStorageKey {
        return (keyish as HLMStorageKey).startsWith('hlm-');
    }

    static get keys(): Array<HLMStorageKey> {
        let keys: Array<HLMStorageKey> = [];

        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i) ?? '';
            if (HLMStorage.isKey(key)) {
                keys.push(key);
            }
        }

        return keys;
    }

    static replace(item: any, key: HLMStorageKey): void {
        localStorage.setItem(key, JSON.stringify(item));
    }

    static retrieve(item: string, key: HLMStorageKey): any {
        let currentValue = JSON.parse(localStorage.getItem(key) ?? '{}');
        return currentValue[item];
    }

    static store(item: string, value: any, key: HLMStorageKey): void {
        let currentValue = JSON.parse(localStorage.getItem(key) ?? '{}');
        currentValue[item] = value;
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export default HLMStorage;