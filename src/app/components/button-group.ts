import { contentChildren, Directive, effect, ElementRef, untracked } from "@angular/core";
import { ButtonComponent } from "./button";


@Directive({
  selector: "app-button-group"
})
export class ButtonGroupDirective {
  private _buttons = contentChildren(ButtonComponent, { read: ElementRef });


  constructor() {
    effect(() => {
      const buttons = this._buttons();
      if (!buttons || buttons.length < 2) { return; }

      untracked(() => {
        for (let i = 0; i < buttons.length; i++) {
          const classList = buttons[i].nativeElement.classList as DOMTokenList;

          if (i > 0)
          {
            classList.add("rounded-t-none");
          }

          if (i < buttons.length - 1)
          {
            classList.add("rounded-b-none");
            classList.add("border-b-0");
          }
        }
      });
    });
  }
}
