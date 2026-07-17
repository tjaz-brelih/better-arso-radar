import { Component } from "@angular/core";


@Component({
  selector: "button[appButton], a[appButton]",
  template: `
    <ng-content />
  `,
  host: {
    class: `
      block p-1.5 bg-color-background border border-color-border rounded-lg
      not-disabled:cursor-pointer not-disabled:hover:bg-color-background-hover not-disabled:hover:text-color-text-hover not-disabled:active:bg-color-background-active
      disabled:text-color-disabled disabled:bg-color-background-hover
    `
  }
})
export class ButtonComponent { }
