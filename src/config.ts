import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { DEFAULT_DIALOG_CONFIG, DialogConfig } from '@angular/cdk/dialog';

import { IconService } from './services/icon.service';
import { DialogContainer } from './app/dialogs/dialog';
import { ThemeService } from './services/theme.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),

    provideAppInitializer(() => inject(IconService).loadIconSet()),
    provideAppInitializer(() => inject(ThemeService).setTheme()),

    { provide: DEFAULT_DIALOG_CONFIG, useValue: { ...new DialogConfig(), container: DialogContainer, minWidth: "20rem" } satisfies DialogConfig }
  ]
};
