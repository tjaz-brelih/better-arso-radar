import { Component, computed, effect, ElementRef, inject, signal, viewChild } from "@angular/core";
import { disabled, form, FormField, max } from "@angular/forms/signals";
import { Subscription } from "rxjs";

import { ImageOverlay, Map, TileLayer } from "leaflet";

import { MeteoSiService, RadarImageInfo } from "../../services/meteo-si.service";

import { SharedModule } from "../shared.module";


@Component({
  selector: "app-map",
  templateUrl: "./map.html",
  imports: [SharedModule, FormField]
})
export class MapComponent {
  private readonly _zoomLimit = { min: 7, max: 12 };

  private readonly _meteoService = inject(MeteoSiService);

  private readonly _mapElement = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly _map = computed(() => this.initializeMap(this._mapElement().nativeElement));

  public radarImages = signal<RadarImageInfo[]>([]);
  private _meteoSubscription: Subscription | undefined;

  private _currentRadarImageOverlay: ImageOverlay | undefined;

  public readonly formModel = signal({
    slider: 0
  })

  public readonly form = form(this.formModel, (schemaPath) => {
    max(schemaPath.slider, () => this.radarImages().length - 1);
    disabled(schemaPath.slider, { when: () => this.radarImages().length === 0 });
  });



  constructor() {
    // Computed signals are lazy, so we need to create an effect to ensure the map is initialized.
    effect(() => this._map());

    // this.refreshRadarImage();
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


  private displayRadarImage(): void {
    if (this.radarImages().length === 0) { return; }


    const imageInfo = this.radarImages()[this.radarImages().length - 1];
    const url = this._meteoService.getRadarImageUrl(imageInfo.path);


    this._currentRadarImageOverlay?.removeFrom(this._map());

    this._currentRadarImageOverlay = new ImageOverlay(url, imageInfo.boundingBox, {
      className: "radar-image",
      attribution: '&copy; <a href="https://www.meteo.si">ARSO</a>'
    }).addTo(this._map());
  }


  public refreshRadarImage() {
    this._meteoSubscription?.unsubscribe();

    this._meteoSubscription = this._meteoService.getRadarImage().subscribe(x => {
      console.info("fetching radar image");

      this.radarImages.set(x);

      this.form.slider().value.set(x.length - 1);

      this.displayRadarImage();
    });
  }
}
