import { computed, contentChildren, Directive, effect, ElementRef, input, untracked } from "@angular/core";
import { IconButtonComponent } from "./button";



@Directive({
  selector: "app-button-group",
  host: {
    class: "inline-flex",
    '[class.flex-col]': "this.direction() === 'vertical'",
    '[class.flex-row]': "this.direction() === 'horizontal'"
  }
})
export class ButtonGroupDirective {
  public direction = input<'horizontal' | 'vertical'>('vertical');

  private _classList = computed(() => {
    const dir = this.direction();

    return dir === 'vertical'
      ? ['rounded-t-none', 'rounded-b-none', 'border-b-0']
      : ['rounded-l-none', 'rounded-r-none', 'border-r-0'];
  });

  private _buttons = contentChildren(IconButtonComponent, { read: ElementRef });


  constructor() {
    effect(() => {
      const buttons = this._buttons();
      if (!buttons || buttons.length < 2) { return; }

      untracked(() => {
        for (let i = 0; i < buttons.length; i++) {
          const classList = buttons[i].nativeElement.classList as DOMTokenList;

          if (i > 0) { classList.add(this._classList()[0]); }
          if (i < buttons.length - 1) { classList.add(this._classList()[1], this._classList()[2]); }
        }
      });
    });
  }
}
