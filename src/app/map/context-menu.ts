import { Component, input } from "@angular/core";

import { MenuDirective, MenuItemDirective } from "../components/menu";
import { Marker } from "../../models";


@Component({
  selector: "app-map-context-menu",
  imports: [MenuItemDirective],
  hostDirectives: [MenuDirective],

  template: `
    @let marker = this.marker();

    @if (marker?.name) { <button appMenuItem disabled>{{ marker.name }}</button> }

    <button appMenuItem (click)="this.onEdit()?.(marker)">
      {{ marker ? "Edit marker..." : "Add marker..." }}
    </button>

    @if (marker) { <button appMenuItem (click)="this.onRemove()?.(marker)">Remove marker</button> }
  `
})
export class MapContextMenuComponent {
  marker = input<Marker | undefined>();

  // Callbacks must be provided as inputs rather than outputs
  // This is because when user clicks on a context menu item, the menu is closed and the item component destroyed before the output event is ever fired.
  onEdit = input<(marker: Marker | undefined) => void>();
  onRemove = input<(marker: Marker) => void>();
}
