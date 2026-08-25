import { Service } from "@angular/core";
import { StorageService } from "./settings";


type Settings = {
  theme?: 'light' | 'dark';
};


@Service()
export class SettingsStorageService extends StorageService<Settings> {
  protected readonly _storageKey = "settings";

  protected readonly default: Settings = {
    theme: undefined
  };
}
