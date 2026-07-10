import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, map, mergeMap, Observable, of } from "rxjs";

import { Coordinates } from "../models";
import { environment } from "../environments/environment";


type RadarImageInfo = {
  path: string;
  boundingBox: [
    northEast: Coordinates,
    southWest: Coordinates
  ];
  date: Date;
};

export type RadarImage = RadarImageInfo & { imageData: string; };


@Service()
export class ArsoMeteoService {
  private readonly BASE_URL = environment.meteoUrl;

  private readonly _client = inject(HttpClient);

  private readonly _radarImageCache: RadarImage[] = [];



  public getRadarImages(): Observable<{ removed: RadarImage[], added: RadarImage[] }> {
    return this._getRadarImageInfo().pipe(
      mergeMap(info => {
        let removed: RadarImage[] = [];
        let added: RadarImageInfo[] = [];

        if (this._radarImageCache.length === 0) {
          added = info;
        }
        else {
          removed = this._removeOldRadarImages(info);
          added = removed.length > 0 ? info.slice(-removed.length) : [];
        }

        if (added.length === 0) {
          return of({ removed, added: [] });
        }

        return forkJoin(added.map(i => this._getRadarImage(i))).pipe(
          map(images => {
            this._radarImageCache.push(...images);

            return { removed, added: images };
          })
        );
      })
    );
  }


  private _getRadarImageInfo(): Observable<RadarImageInfo[]> {
    const url = `${this.BASE_URL}/uploads/probase/www/nowcast/inca/inca_si0zm_data.json`;

    return this._client.get<{ valid: string, path: string, bbox: string }[]>(url).pipe(
      map(arr => arr
        .map(x => {
          const split = x.bbox.split(",").map(Number);

          return <RadarImageInfo>{
            path: `${this.BASE_URL}${x.path}`,
            boundingBox: [ [split[2], split[3]], [split[0], split[1]] ],
            date: new Date(x.valid),
          };
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
      )
    );
  }

  private _getRadarImage(info: RadarImageInfo): Observable<RadarImage> {
    return this._client.get(info.path, { responseType: "blob" }).pipe(
      map(blob => (<RadarImage>{
        imageData: URL.createObjectURL(blob),
        date: info.date,
        boundingBox: info.boundingBox
      }))
    );
  }

  // Removes cached images that are not present in provided info list.
  private _removeOldRadarImages(info: RadarImageInfo[]) {
    const removeToIndex = this._radarImageCache.findIndex(x => x.date.getTime() === info[0].date.getTime());
    const imagesToRemove = this._radarImageCache.slice(0, removeToIndex);

    for (const image of imagesToRemove) {
      this._radarImageCache.shift();
      URL.revokeObjectURL(image.imageData);
    }

    return imagesToRemove;
  }
}
