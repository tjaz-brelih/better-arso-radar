import { Component, computed, effect, ElementRef, inject, viewChild } from "@angular/core";

import { CircleMarker, ImageOverlay, LatLngTuple, Map, TileLayer } from "leaflet";

import { MeteoSiService, RadarImageInfo } from "../../services/meteo-si.service";


@Component({
  selector: "app-map",
  templateUrl: "./map.html"
})
export class MapComponent {
  private readonly _zoomLimit = { min: 7, max: 12 };

  private readonly _meteoService = inject(MeteoSiService);

  private readonly _mapElement = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly _map = computed(() => this.initializeMap(this._mapElement().nativeElement));




  constructor() {
    // Computed signals are lazy, so we need to create an effect to ensure the map is initialized.
    effect(() => this._map());

    this._meteoService.getRadarImageInfo().subscribe(x => {
      this.overlayRadarImage(x[x.length - 1]);
    });
  }



  private initializeMap(element: HTMLElement): Map {
    const map = new Map(element).setView([46.120, 14.815], 8);

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      minZoom: this._zoomLimit.min,
      maxZoom: this._zoomLimit.max,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map;
  }


  private overlayRadarImage(imageInfo: RadarImageInfo): void {
    const url = this._meteoService.getRadarImageUrl(imageInfo.path);

    new ImageOverlay(url, imageInfo.boundingBox, {
      className: "radar-image",
      attribution: '&copy; <a href="https://www.meteo.si">ARSO</a>'
    }).addTo(this._map());
  }
}
