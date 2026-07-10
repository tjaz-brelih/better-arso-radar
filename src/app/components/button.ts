import { Component } from "@angular/core";


@Component({
  selector: "button[appButton], a[appButton]",
  template: `
    <ng-content></ng-content>
  `,
  host: {
    'class': `
      px-3 py-1 rounded-full cursor-pointer font-semibold text-sm bg-teal-500 text-white
      disabled:cursor-default disabled:bg-gray-300
      hover:bg-teal-600`
  }
})
export class ButtonComponent { }
