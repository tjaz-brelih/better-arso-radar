import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";


@Service()
export class IconService {
  private readonly _client = inject(HttpClient);
  private readonly _url = "resources/icons.svg";

  private readonly _iconSet = new Map<string, SVGElement>();


  public loadIconSet(): Observable<void> {
    return this._iconSet.size > 0
      ? of()
      : this._client.get(this._url, { responseType: "text" }).pipe(map(x => this._parseIconSet(x))
    );
  }

  public getIcon(id: string): SVGElement | undefined {
    return this._iconSet.get(id)?.cloneNode(true) as SVGElement | undefined;
  }


  // Parameter html is trusted to be a valid and safe HTML string containing SVG elements.
  // It is potentially vulnerable to XSS attacks.
  private _parseIconSet(html: string) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const svgElements = div.querySelectorAll("svg");

    svgElements.forEach(svg => {
      const id = svg.getAttribute("id");
      if (id) { this._iconSet.set(id, svg); }
    });
  }
}
