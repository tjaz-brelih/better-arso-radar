import { Directive } from "@angular/core";
import { CdkMenu, CdkMenuItem } from "@angular/cdk/menu";


@Directive({
  selector: '[appMenu]',
  hostDirectives: [CdkMenu],
  host: {
    class: `
      min-w-56 py-1 rounded-lg text-sm shadow-xl/30 bg-color-background border border-color-border
    `
  }
})
export class MenuDirective { }


@Directive({
  selector: 'button[appMenuItem]',
  hostDirectives: [CdkMenuItem],
  host: {
    class: `
      w-full px-4 py-1.5 text-start select-none
      not-disabled:cursor-pointer
      disabled:text-color-disabled
      focus:outline-0
      hover:not-disabled:bg-color-background-hover hover:not-disabled:text-color-text-hover hover:not-disabled:text-shadow-hover
    `
  }
})
export class MenuItemDirective { }
