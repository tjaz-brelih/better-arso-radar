import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, map, mergeMap, Observable, of } from "rxjs";

import { environment } from "../environments/environment";


type RadarImageInfo = {
  path: string;
  boundingBox: [
    northEast: [number, number],
    southWest: [number, number]
  ];
  date: Date;
};

export type RadarImage = RadarImageInfo & { imageData: string; };


@Service()
export class MeteoSiService {
  private readonly BASE_URL = environment.meteoUrl;

  private readonly _client = inject(HttpClient);

  private readonly _radarImageCache: RadarImage[] = [];



  public getRadarImages(): Observable<{ removed: RadarImage[], added: RadarImage[] }> {
    return this._getRadarImageInfo().pipe(
      mergeMap(info => {
        const removed = this._removeOldRadarImages(info);

        // Generate requests only for images that are not already cached.
        const requests = info
          .filter(x => !this._radarImageCache.some(cached => cached.date.getTime() === x.date.getTime()))
          .map(i => this._getRadarImage(i));

        if (requests.length === 0) {
          return of({ removed, added: [] });
        }

        return forkJoin(requests).pipe(
          map(added => {
            this._radarImageCache.push(...added);
            this._radarImageCache.sort((a, b) => a.date.getTime() - b.date.getTime());

            return { removed, added };
          })
        );
      })
    );
  }


  private _getRadarImageInfo(): Observable<RadarImageInfo[]> {
    const url = `${this.BASE_URL}/uploads/probase/www/nowcast/inca/inca_si0zm_data.json`;

    return this._client.get<{ valid: string, path: string, bbox: string }[]>(url).pipe(
      map(arr => arr.map(x => {
        const split = x.bbox.split(",").map(Number);

        return {
          path: this._getRadarImageUrl(x.path),
          boundingBox: [ [split[2], split[3]], [split[0], split[1]] ],
          date: new Date(x.valid),
        };
      }))
    );
  }

  private _getRadarImage(info: RadarImageInfo): Observable<RadarImage> {
    return this._client.get(info.path, { responseType: "blob" }).pipe(
      map(blob => (<RadarImage>{
        imageData: URL.createObjectURL(blob),
        date: info.date,
        boundingBox: info.boundingBox
      })
      )
    );
  }

  private _getRadarImageUrl(path: string): string {
    return `${this.BASE_URL}${path}`;
  }

  // Removes cached images that are not present in provided info list.
  private _removeOldRadarImages(info: RadarImageInfo[]) {
    const imagesToRemove = this._radarImageCache.filter(cached => !info.some(i => i.date.getTime() === cached.date.getTime()));

    for (const image of imagesToRemove) {
      const index = this._radarImageCache.indexOf(image);
      this._radarImageCache.splice(index, 1);
      URL.revokeObjectURL(image.imageData);
    }

    return imagesToRemove;
  }
}
