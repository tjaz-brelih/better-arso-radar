import { Component, computed, effect, ElementRef, inject, signal, untracked, viewChild } from "@angular/core";
import { disabled, form, FormField, max } from "@angular/forms/signals";
import { DatePipe } from "@angular/common";

import { ImageOverlay, Map, TileLayer } from "leaflet";

import { MeteoSiService, RadarImage } from "../../services/meteo-si.service";

import { SharedModule } from "../shared.module";


type CurrentImage = {
  layer: ImageOverlay;
  radarImage: RadarImage;
};


@Component({
  selector: "app-map",
  templateUrl: "./map.html",
  imports: [SharedModule, FormField, DatePipe]
})
export class MapComponent {
  private readonly _zoomLimit = { min: 7, max: 12 };

  private readonly _meteoService = inject(MeteoSiService);

  private readonly _mapElement = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly _map = computed(() => this.initializeMap(this._mapElement().nativeElement));

  public readonly isLoading = signal(false);

  public readonly radarImages = signal<CurrentImage[]>([]);
  public readonly currentRadarImage = signal<CurrentImage | undefined>(undefined);

  public readonly refreshedAt = signal<Date | undefined>(undefined);


  public readonly formModel = signal({
    slider: 0
  });

  public readonly form = form(this.formModel, f => {
    max(f.slider, () => this.radarImages().length - 1);
    disabled(f.slider, { when: () => this.radarImages().length === 0 });
  });



  constructor() {
    // Computed signals are lazy, so we need to create an effect to ensure the map is initialized.
    effect(() => this._map());

    effect(() => {
      const sliderValue = this.form.slider().value();

      untracked(() => this.displayRadarImage(sliderValue));
    });

    effect(() => {
      this.radarImages();

      console.log("radar images refreshed");
    });
  }



  private initializeMap(element: HTMLElement): Map {
    const map = new Map(element, {
      minZoom: this._zoomLimit.min,
      maxZoom: this._zoomLimit.max,

      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 60 * 1.5,

      center: [46.120, 14.815],
      zoom: 8
    });

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
  }


  private displayRadarImage(index?: number) {
    if (this.radarImages().length === 0) { return; }

    index ??= this.radarImages().length - 1;

    const image = this.radarImages()[index];


    this.currentRadarImage()?.layer.setOpacity(0);
    this.currentRadarImage.set(image);
    this.currentRadarImage()!.layer.setOpacity(1);
  }


  public refreshRadarImage() {
    this.isLoading.set(true);

    this._meteoService.getRadarImages().subscribe(({ removed, added }) => {
      this.isLoading.set(false);

      this._removeRadarImages(removed);
      this._addRadarImages(added);

      this.form.slider().value.set(0); // This should help the slider effect to trigger in case the slider is already at the last index.
      this.form.slider().value.set(this.radarImages().length - 1);

      this.refreshedAt.set(new Date());

      this.radarImages.set(this.radarImages().map(x => x));
    });
  }


  private _removeRadarImages(images: RadarImage[]) {
    images.forEach(image => {
      const index = this.radarImages().findIndex(i => i.radarImage === image);
      const removedImage = this.radarImages().splice(index, 1)[0];

      removedImage.layer.removeFrom(this._map());
    });
  }

  private _addRadarImages(images: RadarImage[]) {
    images.forEach(image => {
      const layer = new ImageOverlay(image.imageData, image.boundingBox, {
        className: "radar-image",
        opacity: 0,
        attribution: '&copy; <a href="https://www.meteo.si">ARSO</a>'
      }).addTo(this._map());

      this.radarImages().push({ layer, radarImage: image });
    });
  }
}
