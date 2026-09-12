import { Component, computed, effect, ElementRef, inject, Signal, signal, untracked, viewChild } from "@angular/core";
import { disabled, form, FormField, max } from "@angular/forms/signals";
import { DatePipe } from "@angular/common";
import { Subscription, timer } from "rxjs";

import { CdkContextMenuTrigger } from "@angular/cdk/menu";
import { Dialog } from "@angular/cdk/dialog";

import { CircleMarker, ImageOverlay, LayerGroup, Map, Point, TileLayer } from "leaflet";

import { SharedModule } from "../shared.module";
import { ArsoMeteoService, RadarImage } from "../../services/meteo-si.service";
import { PositionStorageService } from "../../services/position.storage";
import { MarkerStorageService } from "../../services/marker.storage";
import { MenuDirective, MenuItemDirective } from "../components/menu";
import { DEFAULT_MARKER_COLOR, Marker } from "../../models";

import { SettingsDialogComponent } from "../dialogs/settings.dialog";
import { MarkerDialogComponent } from "../dialogs/marker.dialog";


type LayerRadarImage = {
  layer: ImageOverlay;
  radarImage: RadarImage;
};

type ContextMenuItem = {
  text: string | (() => string);
  visible?: Signal<boolean>;
  disabled?: Signal<boolean>;
  action: (event: PointerEvent) => void;
};


@Component({
  selector: "app-map",
  templateUrl: "./map.html",
  imports: [SharedModule, FormField, DatePipe, CdkContextMenuTrigger, MenuDirective, MenuItemDirective]
})
export class MapComponent {
  private readonly _zoomLimit = { min: 6, max: 14 };

  private readonly _dialog = inject(Dialog);

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


  private _markerLayerGroup = new LayerGroup();
  private _markerGroup: { layer: CircleMarker, marker: Marker }[] = [];


  public readonly contextMenuPosition = signal<PointerEvent | undefined>(undefined);

  public readonly contextMenu: ContextMenuItem[] = [
    {
      text: () => {
        const position = this.contextMenuPosition();
        if (!position) { return ""; }

        return this._getClosestMarker(position)?.marker.name!;
      },
      visible: computed(() => {
        const position = this.contextMenuPosition();
        if (!position) { return false; }

        return !!(this._getClosestMarker(position)?.marker.name);
      }),
      disabled: computed(() => true),
      action: () => { }
    },
    {
      text: "Add marker...",
      visible: computed(() => {
        const position = this.contextMenuPosition();
        if (!position) { return true; }

        return !this._getClosestMarker(position);
      }),
      action: position => {
        const point: Point = (this._map() as any).pointerEventToContainerPoint(position);
        const latLng = this._map().containerPointToLatLng(point);

        MarkerDialogComponent.open(this._dialog, { coordinates: [latLng.lat, latLng.lng] }).closed.subscribe(x => {
          if (!x) { return; }

          this._addMarker(x);
        });
      }
    },

    {
      text: "Edit marker...",
      visible: computed(() => {
        const position = this.contextMenuPosition();
        if (!position) { return false; }

        return !!this._getClosestMarker(position!);
      }),
      action: position => {
        const closestMarker = this._getClosestMarker(position);
        if (!closestMarker) { return; }

        MarkerDialogComponent.open(this._dialog, closestMarker.marker).closed.subscribe(x => {
          if (!x) { return; }

          this._updateMarker({ layer: closestMarker.layer, oldMarker: closestMarker.marker, marker: x });
        });
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

        this._removeMarker(closestMarker.layer, closestMarker.marker);
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

      untracked(() => this._displayRadarImage(sliderValue));
    });

    effect(() => {
      const refreshedAt = this.refreshedAt();
      if (!refreshedAt) { return; }

      console.info("🌦️ refreshed radar images", refreshedAt.toLocaleTimeString());
    });


    this.triggerTimer();
  }


  private initializeMap(element: HTMLElement): Map {
    const position = this._positionStorage.get();

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

    this._markerStorage.getMarkers().forEach(marker => {
      this._addMarker(marker, false);
    });

    new TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      className: "dark:invert dark:grayscale"
    }).addTo(map);

    map.addLayer(this._markerLayerGroup);

    return map;
  }


  public zoom(direction: "in" | "out") {
    direction === "in" ? this._map().zoomIn() : this._map().zoomOut();
  }

  public setGeolocationMarker() {
    navigator.geolocation.getCurrentPosition(
      position => {
        const marker: Marker = {
          coordinates: [position.coords.latitude, position.coords.longitude],
          color: DEFAULT_MARKER_COLOR
        };

        this._addMarker(marker);

        console.info("🌦️ added geolocation marker", marker);
      },

      error => console.warn("🌦️ failed to get geolocation", error)
    );
  }

  public openSettingsDialog() {
    SettingsDialogComponent.open(this._dialog);
  }


  private _displayRadarImage(index?: number) {
    if (this.radarImages().length === 0) { return; }

    const image = this.radarImages()[index ?? this.radarImages().length - 1];

    this.currentRadarImage()?.layer.setOpacity(0);
    this.currentRadarImage.set(image);
    this.currentRadarImage()!.layer.setOpacity(1);
  }


  public triggerTimer() {
    this._subscription?.unsubscribe();
    this._subscription = timer(0, 5 * 60 * 1000).subscribe(() => this._loadRadarImages());
  }


  private _loadRadarImages() {
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
        attribution: '&copy; <a href="https://www.meteo.si">ARSO</a>',
        className: "pixelated select-none dark:brightness-75",
        opacity: 0,
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


  private _addMarker(marker: Marker, store: boolean = true) {
    const layer = new CircleMarker(marker.coordinates, {
      color: marker.color!.rgb,
      radius: 5,
      fillColor: "transparent"
    });

    this._markerLayerGroup.addLayer(layer);
    this._markerGroup.push({ layer, marker });

    if (store) { this._markerStorage.addMarker(marker); }
  }

  private _updateMarker(data: { layer: CircleMarker, oldMarker: Marker, marker: Marker }) {
    this._removeMarker(data.layer, data.oldMarker);
    this._addMarker(data.marker);
  }

  private _removeMarker(layer: CircleMarker, marker: Marker) {
    const index = this._markerGroup.findIndex(i => i.layer === layer);
    if (index === -1) { return; }

    this._markerLayerGroup.removeLayer(layer);
    this._markerGroup.splice(index, 1);

    this._markerStorage.removeMarker(marker);
  }

  private _getClosestMarker(event: PointerEvent): { layer: CircleMarker, marker: Marker } | undefined {
    let closest: { layer: CircleMarker, marker: Marker, distance: number } | undefined;
    const containerPoint = (this._map() as any).pointerEventToContainerPoint(event);

    this._markerGroup.forEach(({ layer, marker }) => {
      const latLng = layer.getLatLng();
      const markerPoint = this._map().latLngToContainerPoint(latLng);

      const distance = markerPoint.distanceTo(containerPoint);

      // Determined experimentally
      if (distance > 7) { return; }

      if (!closest || distance < closest.distance) {
        closest = { layer, marker, distance };
      }
    });

    return closest;
  }
}
