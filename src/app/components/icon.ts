import { Component, effect, ElementRef, inject, input, untracked } from "@angular/core";

import { IconService } from "../../services/icon.service";


@Component({
  selector: "app-icon",
  template: "",
  host: {
    class: "size-full"
  }
})
export class IconComponent {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _iconService = inject(IconService);

  public icon = input.required<string>();


  constructor() {
    effect(() => {
      const iconId = this.icon();
      if (!iconId) { return; }

      untracked(() => {
        const svg = this._iconService.getIcon(iconId);
        if (!svg) { return; }

        this._removeExistingElements();
        this._elementRef.nativeElement.appendChild(svg);
      });
    });
  }


  private _removeExistingElements() {
    const element = this._elementRef.nativeElement;
    let count = element.childNodes.length;

    while (count--) {
      const child = element.childNodes[count];
      if (child.nodeType !== 1) { child.remove(); }
    }
  }
}
