import { Component, input } from "@angular/core";


@Component({
  selector: "button[appButton], a[appButton]",
  template: `
    <ng-content />
  `,
  host: {
    class: `
      p-1.5 h-9 min-w-9 bg-color-background border border-color-border rounded-lg
      flex items-center justify-center
      not-disabled:cursor-pointer not-disabled:hover:bg-color-background-hover not-disabled:hover:text-color-text-hover
      not-disabled:active:bg-color-background-active
      disabled:text-color-disabled disabled:bg-color-background-hover
    `,

    '[class.bg-color-background-hover]': "this.active()",
    '[class.text-color-text-hover]': "this.active()"
  }
})
export class ButtonComponent {
  public active = input<boolean>(false);
 }
