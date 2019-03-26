export const defaultSettings: SavedSettings = {
    domains: ['github.com']
};

export interface SavedSettings {
    domains?: string[]
}
