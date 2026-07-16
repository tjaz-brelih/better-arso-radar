import { Service } from "@angular/core";


type Position = {
  center: [number, number],
  zoom: number
};


@Service()
export class PositionStorageService {
  private readonly _storageKey = "position";
  private readonly _storage = window.localStorage;

  private static readonly DefaultPosition: Position = {
    center: [46.120, 14.815],
    zoom: 8
  };


  public getPosition(): Position {
    return this._getInternal() ?? PositionStorageService.DefaultPosition;
  }

  public savePosition(position: Position) {
    this._storage.setItem(this._storageKey, JSON.stringify(position));
  }


  private _getInternal(): Position | undefined {
    try {
      return <Position>JSON.parse(this._storage.getItem(this._storageKey) ?? "");
    }
    catch {
      return undefined;
    }
  }
}
