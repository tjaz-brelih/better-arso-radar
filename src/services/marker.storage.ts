import { Service } from "@angular/core";

import { StorageService } from "./settings";
import { Coordinates, DEFAULT_MARKER_COLOR, Marker } from "../models";



@Service()
export class MarkerStorageService extends StorageService<Marker[]> {
  protected readonly _storageKey = "markers";

  protected readonly default = <Marker[]>[];

  private _markers = <Marker[]>[];


  public getMarkers(): Marker[] {
    this._markers = this._migrate();
    this._markers.forEach(marker => { if (!marker.color) { marker.color = DEFAULT_MARKER_COLOR; } });

    return this._markers;
  }

  public addMarker(marker: Marker) {
    this._markers.push(marker);
    this.save(this._markers);
  }

  public removeMarker(marker: Marker) {
    this._markers.splice(this._markers.findIndex(x => x === marker), 1);
    this.save(this._markers);
  }


  // Migrate old marker storage format to the new format.
  private _migrate(): Marker[] {
    let markers = this._get();
    if (markers.length === 0) { return []; }

    // Old marker storage used to store markers as arrays of coordinates
    if (Array.isArray(markers[0])) {
      markers = (markers as any as Coordinates[]).map(coordinates => ({ coordinates }));

      this.save(markers);
    }

    return markers;
  }
}
