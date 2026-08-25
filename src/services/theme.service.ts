import { Service } from "@angular/core";
import { StorageService } from "./settings";


export type Theme = 'light' | 'dark' | undefined;


@Service()
export class ThemeService extends StorageService<Theme> {
  protected override _storageKey = "theme";
  protected override default = undefined;


  public setTheme() {
    const theme = this.get();

    const classList = window.document.documentElement.classList;
    classList.remove("dark");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === 'dark' || (theme === undefined && prefersDark)) {
      classList.add("dark");
    }
  }
}
