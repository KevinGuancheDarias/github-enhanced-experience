import { SavedSettings, defaultSettings } from '../types/saved-settings.type';

export abstract class SettingsUtil {
    public static findConfig(settings: SavedSettings = defaultSettings): Promise<SavedSettings> {
        return chrome.storage.sync.get(settings);
    }

    public static saveConfig(config: SavedSettings): Promise<void> {
        return chrome.storage.sync.set(config);
    }

    public static isRegisteredDomain(settings: SavedSettings): boolean {
        return settings.domains.some(current => document.domain === current);
    }
    private constructor() { }
}