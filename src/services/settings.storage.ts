import { Service } from "@angular/core";
import { StorageService } from "./storage";


type Settings = {
  theme?: 'auto' | 'light' | 'dark';
  opacity?: number;
};


@Service()
export class SettingsService extends StorageService<Settings> {
  protected readonly _storageKey = "settings";

  protected readonly default: Required<Settings> = {
    theme: 'auto',
    opacity: 1
  };

  private _settings: Required<Settings>;

  public get settings() {
    return this._settings;
  }


  constructor() {
    super();

    const s = this._getFromStorage();

    this._settings = {
      theme: s.theme ?? this.default.theme,
      opacity: s.opacity ?? this.default.opacity,
    };
  }


  public setTheme() {
    const { theme } = this.settings;

    const classList = window.document.documentElement.classList;
    classList.remove("dark");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === 'dark' || ((theme === undefined || theme === 'auto') && prefersDark)) {
      classList.add("dark");
    }
  }

  public save(value: Partial<Settings>) {
    this._settings = { ...this._settings, ...value };
    this._saveToStorage(this._settings);
  }
}
