import { Component, input } from "@angular/core";


type ButtonStyle = 'text' | 'filled' | 'outlined';


@Component({
  selector: "button[appIconButton], a[appIconButton]",
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
export class IconButtonComponent {
  public active = input<boolean>(false);
}



@Component({
  selector: "button[appButton]",
  template: `<ng-content />`,
  host: {
    class: `
      px-4 py-1.5 rounded-lg
      text-color-primary font-medium
      cursor-pointer
      hover:bg-color-primary/20
    `,
    "[class.bg-color-primary]": "this.style() === 'filled'",
    "[class.text-white]": "this.style() === 'filled'",
    "[class.hover:bg-color-primary/70]": "this.style() === 'filled'",
  }
})
export class ButtonComponent {
  style = input<ButtonStyle | "">('text', { alias: "appButton" });
}
