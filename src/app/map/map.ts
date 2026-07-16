import { Component, computed, effect, ElementRef, inject, Signal, signal, untracked, viewChild } from "@angular/core";
import { disabled, form, FormField, max } from "@angular/forms/signals";
import { DatePipe } from "@angular/common";
import { Subscription, timer } from "rxjs";

import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from "@angular/cdk/menu";

import { CircleMarker, ImageOverlay, LayerGroup, Map, Point, TileLayer } from "leaflet";

import { ArsoMeteoService, RadarImage } from "../../services/meteo-si.service";
import { PositionStorageService } from "../../services/position.storage";
import { MarkerStorageService } from "../../services/marker.storage";

import { SharedModule } from "../shared.module";
import { Coordinates } from "../../models";


type LayerRadarImage = {
  layer: ImageOverlay;
  radarImage: RadarImage;
};

type ContextMenuItem = {
  text: string;
  visible?: Signal<boolean>;
  disabled?: Signal<boolean>;
  action: (event: PointerEvent) => void;
};


@Component({
  selector: "app-map",
  templateUrl: "./map.html",
  imports: [SharedModule, FormField, DatePipe, CdkContextMenuTrigger, CdkMenu, CdkMenuItem]
})
export class MapComponent {
  private readonly _zoomLimit = { min: 7, max: 14 };

  private readonly _meteoService = inject(ArsoMeteoService);
  private readonly _markerStorage = inject(MarkerStorageService);
  private readonly _positionStorage = inject(PositionStorageService);

  private readonly _mapElement = viewChild.required<ElementRef<HTMLElement>>('map');
  private readonly _map = computed(() => this.initializeMap(this._mapElement().nativeElement));

  public readonly isLoading = signal(false);

  public readonly radarImages = signal<LayerRadarImage[]>([]);
  public readonly currentRadarImage = signal<LayerRadarImage | undefined>(undefined);

  public readonly refreshedAt = signal<Date | undefined>(undefined);

  private _subscription: Subscription | undefined = undefined;


  private _markerGroup = new LayerGroup();


  public readonly contextMenuPosition = signal<PointerEvent | undefined>(undefined);

  public readonly contextMenu: ContextMenuItem[] = [
    {
      text: "Add marker",
      disabled: computed(() => {
        const position = this.contextMenuPosition();
        if (!position) { return true; }

        return !!this._getClosestMarker(position);
      }),
      action: position => {
        const point: Point = (this._map() as any).pointerEventToContainerPoint(position);
        const latLng = this._map().containerPointToLatLng(point);

        this._addMarker([latLng.lat, latLng.lng]);
      }
    },

    {
      text: "Remove marker",
      visible: computed(() => {
        const position = this.contextMenuPosition();
        if (!position) { return false; }

        return !!this._getClosestMarker(position!);
      }),
      action: position => {
        const closestMarker = this._getClosestMarker(position);
        if (!closestMarker) { return; }

        this._removeMarker(closestMarker.marker, closestMarker.coords);
      }
    }
  ];


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
    const position = this._positionStorage.getPosition();

    const map = new Map(element, {
      zoomControl: false,

      minZoom: this._zoomLimit.min,
      maxZoom: this._zoomLimit.max,

      zoomSnap: 0.5,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 60 * 1.5,

      center: position.center,
      zoom: position.zoom
    });

    this._markerStorage.getMarkers().forEach(coords => {
      this._addMarker(coords, false);
    });

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.addLayer(this._markerGroup);

    return map;
  }


  public zoom(direction: "in" | "out") {
    direction === "in" ? this._map().zoomIn() : this._map().zoomOut();
  }

  public setDefaultPosition() {
    const center = this._map().getCenter();
    const zoom = this._map().getZoom();

    this._positionStorage.savePosition({ center: [center.lat, center.lng], zoom });
  }

  public resetPosition() {
    const position = this._positionStorage.getPosition();

    this._map().setView(position.center, position.zoom);
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


  private _addMarker(coords: Coordinates, store: boolean = true) {
    const marker = new CircleMarker(coords, {
      color: "red",
      radius: 5,
      fillColor: "transparent"
    });

    this._markerGroup.addLayer(marker);

    if (store) { this._markerStorage.addMarker(coords); }
  }

  private _removeMarker(marker: CircleMarker, coords: Coordinates) {
    this._markerGroup.removeLayer(marker);
    this._markerStorage.removeMarker(coords);
  }

  private _getClosestMarker(event: PointerEvent): { marker: CircleMarker, coords: Coordinates } | undefined {
    let closest: { marker: CircleMarker, coords: Coordinates, distance: number } | undefined = undefined;
    const containerPoint = (this._map() as any).pointerEventToContainerPoint(event);

    this._markerGroup.getLayers().forEach(layer => {
      const marker = layer as CircleMarker;
      const latLng = marker.getLatLng();
      const markerPoint = this._map().latLngToContainerPoint(latLng);

      const distance = markerPoint.distanceTo(containerPoint);

      // Determined experimentally
      if (distance > 7) { return; }

      if (!closest || distance < closest.distance) {
        closest = {
          marker,
          coords: [latLng.lat, latLng.lng],
          distance
        };
      }
    });

    return closest;
  }
}
