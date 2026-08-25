import { Component } from "@angular/core";

import { CdkPortalOutlet } from "@angular/cdk/portal";
import { CdkDialogContainer } from "@angular/cdk/dialog";


@Component({
  selector: "app-dialog-container",
  imports: [CdkPortalOutlet],

  template: `
    <div class="bg-color-background border border-color-border p-6 rounded-2xl shadow-xl/50">
      <ng-template cdkPortalOutlet />
    </div>
  `,

  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: inherit;
      max-height: inherit;
    }
  `
})
export class DialogContainer extends CdkDialogContainer { }
