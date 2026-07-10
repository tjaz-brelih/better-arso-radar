import { Service } from "@angular/core";
import { Coordinates } from "../models";


@Service()
export class MarkerStorageService {
  private readonly _storage = localStorage;
  private readonly _storageKey = "markers";

  private _markers = <Coordinates[]>[];


  public getMarkers(): Coordinates[] {
    this._markers = this._getMarkersFromStorage();
    return this._markers;
  }

  public addMarker(marker: Coordinates) {
    this._markers.push(marker);
    this.saveMarkers(this._markers);
  }

  public removeMarker(marker: Coordinates) {
    this._markers.splice(this._markers.findIndex(x => x === marker), 1);
    this.saveMarkers(this._markers);
  }

  public saveMarkers(markers: Coordinates[]) {
    this._storage.setItem(this._storageKey, JSON.stringify(markers));
  }


  private _getMarkersFromStorage(): Coordinates[] {
    try {
      return <Coordinates[]>JSON.parse(this._storage.getItem(this._storageKey) ?? "[]");
    }
    catch {
      return [];
    }
  }
}
