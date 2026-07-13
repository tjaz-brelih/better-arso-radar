import { Component, computed, effect, ElementRef, inject, signal, untracked, viewChild } from "@angular/core";
import { disabled, form, FormField, max } from "@angular/forms/signals";
import { DatePipe } from "@angular/common";
import { Subscription, timer } from "rxjs";

import { CircleMarker, ImageOverlay, LayerGroup, Map, TileLayer } from "leaflet";

import { MarkerStorageService } from "../../services/marker.storage";
import { ArsoMeteoService, RadarImage } from "../../services/meteo-si.service";

import { SharedModule } from "../shared.module";
import { Coordinates } from "../../models";


type LayerRadarImage = {
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

  private readonly _meteoService = inject(ArsoMeteoService);
  private readonly _markerStorage = inject(MarkerStorageService);

  private readonly _mapElement = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly _map = computed(() => this.initializeMap(this._mapElement().nativeElement));

  public readonly isLoading = signal(false);

  public readonly radarImages = signal<LayerRadarImage[]>([]);
  public readonly currentRadarImage = signal<LayerRadarImage | undefined>(undefined);

  public readonly refreshedAt = signal<Date | undefined>(undefined);

  private _subscription: Subscription | undefined = undefined;


  private _markerGroup = new LayerGroup();


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
      const refreshedAt = this.refreshedAt();
      if (!refreshedAt) { return; }

      console.info("🌦️ refreshed radar images", refreshedAt.toLocaleTimeString());
    });


    this.triggerTimer();
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

    this._markerStorage.getMarkers().forEach(coords => {
      this._addMarker(coords, true);
    });

    map.on("contextmenu", (event) => {
      const coords: Coordinates = [event.latlng.lat, event.latlng.lng];
      this._addMarker(coords);
    });

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.addLayer(this._markerGroup);

    return map;
  }


  private displayRadarImage(index?: number) {
    if (this.radarImages().length === 0) { return; }

    const image = this.radarImages()[index ?? this.radarImages().length - 1];

    this.currentRadarImage()?.layer.setOpacity(0);
    this.currentRadarImage.set(image);
    this.currentRadarImage()!.layer.setOpacity(1);
  }


  public triggerTimer() {
    this._subscription?.unsubscribe();
    this._subscription = timer(0, 5 * 60 * 1000).subscribe(() => this.loadRadarImages());
  }


  public loadRadarImages() {
    this.isLoading.set(true);

    this._meteoService.getRadarImages().subscribe(({ removed, added }) => {
      this.isLoading.set(false);

      this._removeRadarImages(removed);
      this._addRadarImages(added);

      this.form.slider().value.set(0); // This should help the slider effect to trigger in case the slider is already at the last index.
      this.form.slider().value.set(this.radarImages().length - 1);

      this.refreshedAt.set(new Date());
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

  private _removeRadarImages(images: RadarImage[]) {
    images.forEach(image => {
      const index = this.radarImages().findIndex(i => i.radarImage === image);
      const removedImage = this.radarImages().splice(index, 1)[0];

      removedImage.layer.removeFrom(this._map());
    });
  }


  private _addMarker(coords: Coordinates, noStore?: boolean) {
    const marker = new CircleMarker(coords, {
      color: "red",
      radius: 5,
      fillColor: "transparent"
    });

    marker.on("dblclick", () => this._removeMarker(marker, coords));

    this._markerGroup.addLayer(marker);
    if (!noStore) {
      this._markerStorage.addMarker(coords);
    }
  }

  private _removeMarker(marker: CircleMarker, coords: Coordinates) {
    this._markerGroup.removeLayer(marker);
    this._markerStorage.removeMarker(coords);
  }
}
