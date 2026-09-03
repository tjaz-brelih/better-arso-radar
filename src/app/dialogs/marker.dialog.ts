import { Component, inject, signal } from "@angular/core";
import { Dialog, DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { form, FormField } from "@angular/forms/signals";

import { ButtonComponent } from "../components/button";

import { Marker } from "../../services/marker.storage";


@Component({
  imports: [ButtonComponent, FormField],

  template: `
    <h1>Marker settings</h1>

    <div class="py-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-6">

      <section>
        <label>Name</label>

        <div class="w-full">
          <input type="text" placeholder="Name" [formField]="this.markerForm.name" class="w-full px-3 py-1.5 placeholder:text-color-disabled rounded-md border border-color-border focus:outline-2 focus:-outline-offset-2 focus:outline-color-primary" />
        </div>
      </section>

      <section>
        <label>Color</label>

        <div class="flex gap-4 items-center px-1">
          @for (color of this.colors; track color) {
            <div
              class="size-6 rounded-full cursor-pointer data-selected:outline-2 data-selected:outline-offset-2 data-selected:outline-color-text"
              [style.background-color]="color.rgb"
              (click)="this.selectedColor.set(color)"
              [attr.data-selected]="this.selectedColor() === color ? '' : undefined">
            </div>
          }

          <!-- Custom color -->
          <!-- <div class="size-6 rounded-full cursor-pointer bg-linear-to-bl from-pink-500 from-20% to-yellow-500 to-80%"></div> -->
        </div>
      </section>

    </div>

    <div class="flex justify-end gap-4">
      <button appButton (click)="this.close()">Cancel</button>
      <button appButton="filled" (click)="this.save()">Save</button>
    </div>
  `,

  styles: `
    @reference "tailwindcss";

    section {
      @apply col-span-2 grid grid-cols-subgrid items-center;
    }
  `
})
export class MarkerDialogComponent {

  private readonly _dialogRef = inject<DialogRef<Marker | undefined>>(DialogRef);
  private readonly _marker = inject<Marker>(DIALOG_DATA);

  markerModel = signal({ name: this._marker.name ?? "" });
  markerForm = form(this.markerModel);


  public colors = [
    { rgb: "rgb(203, 30, 30)", id: "red" },
    { rgb: "rgb(129, 223, 35)", id: "green" },
    { rgb: "rgb(41, 45, 255)", id: "blue" },
    { rgb: "rgb(220, 184, 40)", id: "yellow" },
    { rgb: "rgb(175, 52, 244)", id: "purple" },
    { rgb: "rgb(24, 195, 223)", id: "cyan" },

    { rgb: "#fff", id: "white" },
    { rgb: "#000", id: "black" }
  ];

  public selectedColor = signal(this.colors[0]);


  public static open(dialog: Dialog, marker: Marker) {
    return dialog.open<Marker | undefined>(MarkerDialogComponent, {
      disableClose: true,
      data: marker
    });
  }


  public close() {
    this._dialogRef.close();
  }

  public save() {
    this._dialogRef.close({
      ...this._marker,
      color: this.selectedColor(),
      name: this.markerModel().name
    })
  }
}
