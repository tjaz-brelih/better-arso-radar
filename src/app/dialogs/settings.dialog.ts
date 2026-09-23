import { Component, effect, inject, signal, untracked } from "@angular/core";
import { Dialog } from "@angular/cdk/dialog";

import { ThemeService } from "services";
import { ButtonGroupDirective, IconButtonComponent, IconComponent, TooltipDirective } from "components";


@Component({
  imports: [ButtonGroupDirective, IconButtonComponent, IconComponent, TooltipDirective],

  template: `
    <h1>Settings</h1>

    <div class="pt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-6">

      <section class="flex flex-row items-center gap-4">
        <label>Theme</label>

        <app-button-group direction="horizontal">
          <button appIconButton [active]="this.theme() === undefined" (click)="this.theme.set(undefined)" appTooltip="Follow system preference" location="bottom">
            <app-icon icon="sun-moon" />
          </button>

          <button appIconButton [active]="this.theme() === 'light'" (click)="this.theme.set('light')" appTooltip="Light theme" location="bottom">
            <app-icon icon="sun" />
          </button>

          <button appIconButton [active]="this.theme() === 'dark'" (click)="this.theme.set('dark')" appTooltip="Dark theme" location="bottom">
            <app-icon icon="moon" />
          </button>
        </app-button-group>
      </section>

    </div>
  `,

  styles: `
    @reference "tailwindcss";

    section {
      @apply col-span-2 grid grid-cols-subgrid items-center;
    }
  `
})
export class SettingsDialogComponent {
  private _themeService = inject(ThemeService);

  public theme = signal(this._themeService.get());



  constructor() {
    effect(() => {
      const theme = this.theme();

      untracked(() => {
        this._themeService.save(theme);
        this._themeService.setTheme();
      });
    });
  }



  public static open(dialog: Dialog) {
    return dialog.open(SettingsDialogComponent);
  }
}
