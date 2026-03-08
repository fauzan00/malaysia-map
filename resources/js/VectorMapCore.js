/**
 * VectorMapCore - SVG vector map renderer
 * Renders GeoJSON as SVG paths with pan/zoom
 */

const TILE_SIZE = 256;
const MAX_ZOOM = 12;
const MIN_ZOOM = 3;

function latLngToPoint(lat, lng, zoom) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
}

function pointToLatLng(x, y, zoom) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / scale)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lng };
}

function projectRing(ring, originX, originY, zoom) {
  return ring.map(([lng, lat]) => {
    const p = latLngToPoint(lat, lng, zoom);
    return [originX + p.x, originY + p.y];
  });
}

function ringToPath(projected) {
  if (projected.length < 2) return "";
  return "M" + projected.map(([x, y]) => `${x},${y}`).join("L") + "Z";
}

function getBounds(features) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  function processCoords(coords) {
    if (typeof coords[0] === "number") {
      const [lng, lat] = coords;
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    } else {
      coords.forEach(processCoords);
    }
  }

  features.forEach((f) => {
    const geom = f.geometry;
    if (geom.type === "Polygon") processCoords(geom.coordinates);
    if (geom.type === "MultiPolygon") geom.coordinates.forEach(processCoords);
  });

  return { minLng, minLat, maxLng, maxLat };
}

function fitBounds(bounds, width, height, padding = 40) {
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  for (let zoom = MAX_ZOOM; zoom >= MIN_ZOOM; zoom--) {
    const scale = TILE_SIZE * Math.pow(2, zoom);
    const minP = latLngToPoint(bounds.maxLat, bounds.minLng, zoom);
    const maxP = latLngToPoint(bounds.minLat, bounds.maxLng, zoom);
    const mapW = maxP.x - minP.x;
    const mapH = maxP.y - minP.y;
    if (mapW <= w && mapH <= h) {
      return { center: [centerLat, centerLng], zoom };
    }
  }
  return { center: [centerLat, centerLng], zoom: MIN_ZOOM };
}

export class VectorMapCore {
  constructor(containerId, options = {}) {
    this.geoData = options.geoData || { type: "FeatureCollection", features: [] };
    this.markers = [];
    this.onRegionClick = options.onRegionClick || null;

    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Map container #${containerId} not found`);

    container.innerHTML = "";
    container.classList.add("vectormap-container");

    this.container = container;
    this.width = container.offsetWidth;
    this.height = container.offsetHeight;

    const bounds = getBounds(this.geoData.features);
    const fitted = fitBounds(bounds, this.width, this.height);
    this.center = options.center || fitted.center;
    this.zoom = options.zoom !== undefined ? options.zoom : Math.round(fitted.zoom);

    this._offsetX = 0;
    this._offsetY = 0;
    this._isDragging = false;
    this._startX = 0;
    this._startY = 0;
    this._startOffsetX = 0;
    this._startOffsetY = 0;

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "vectormap-svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this.svg.style.pointerEvents = "none";

    this.pathsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.pathsGroup.setAttribute("class", "vectormap-paths");

    this.markersGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.markersGroup.setAttribute("class", "vectormap-markers");

    this.svg.appendChild(this.pathsGroup);
    this.svg.appendChild(this.markersGroup);
    container.appendChild(this.svg);

    this._setupEvents();
    this._render();
  }

  _setupEvents() {
    this.container.addEventListener("mousedown", (e) => this._onDragStart(e));
    document.addEventListener("mousemove", (e) => this._onDrag(e));
    document.addEventListener("mouseup", () => this._onDragEnd());
    this.container.addEventListener("wheel", (e) => this._onWheel(e), { passive: false });
    window.addEventListener("resize", () => this._onResize());
  }

  _onDragStart(e) {
    if (e.button !== 0) return;
    this._isDragging = true;
    this._startX = e.clientX;
    this._startY = e.clientY;
    this._startOffsetX = this._offsetX;
    this._startOffsetY = this._offsetY;
  }

  _onDrag(e) {
    if (!this._isDragging) return;
    this._offsetX = this._startOffsetX + (e.clientX - this._startX);
    this._offsetY = this._startOffsetY + (e.clientY - this._startY);
    this._render();
  }

  _onDragEnd() {
    this._isDragging = false;
    const centerPoint = latLngToPoint(this.center[0], this.center[1], this.zoom);
    const originX = this.width / 2 - centerPoint.x - this._offsetX;
    const originY = this.height / 2 - centerPoint.y - this._offsetY;
    const { lat, lng } = pointToLatLng(originX + this.width / 2, originY + this.height / 2, this.zoom);
    this.center = [lat, lng];
    this._offsetX = 0;
    this._offsetY = 0;
    this._render();
  }

  _onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom + delta));
    this._render();
  }

  _onResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    this._render();
  }

  _render() {
    const [lat, lng] = this.center;
    const centerPoint = latLngToPoint(lat, lng, this.zoom);
    const originX = this.width / 2 - centerPoint.x - this._offsetX;
    const originY = this.height / 2 - centerPoint.y - this._offsetY;

    this.pathsGroup.innerHTML = "";
    this.geoData.features.forEach((feature, i) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const geom = feature.geometry;
      const name = feature.properties?.name || feature.properties?.shapeName || feature.properties?.STATE || `Region ${i}`;

      let d = "";
      if (geom.type === "Polygon") {
        geom.coordinates.forEach((ring) => {
          d += ringToPath(projectRing(ring, originX, originY, this.zoom));
        });
      }
      if (geom.type === "MultiPolygon") {
        geom.coordinates.forEach((poly) => {
          poly.forEach((ring) => {
            d += ringToPath(projectRing(ring, originX, originY, this.zoom));
          });
        });
      }

      path.setAttribute("d", d);
      path.setAttribute("class", "vectormap-region");
      path.setAttribute("data-name", name);
      path.style.pointerEvents = "auto";
      path.style.cursor = this.onRegionClick ? "pointer" : "default";

      path.addEventListener("click", () => this.onRegionClick?.(feature));
      path.addEventListener("mouseenter", () => path.classList.add("vectormap-region-hover"));
      path.addEventListener("mouseleave", () => path.classList.remove("vectormap-region-hover"));

      this.pathsGroup.appendChild(path);
    });

    this.markersGroup.innerHTML = "";
    this.markers.forEach((m) => {
      const point = latLngToPoint(m.lat, m.lng, this.zoom);
      const px = originX + point.x;
      const py = originY + point.y;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", `translate(${px},${py})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "6");
      circle.setAttribute("class", "vectormap-marker-dot");
      g.appendChild(circle);

      if (m.popup) {
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = m.popup;
        g.appendChild(title);
      }

      this.markersGroup.appendChild(g);
    });
  }

  setView(center, zoom) {
    this.center = center;
    if (zoom != null) this.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
    this._render();
    return this;
  }

  addMarker(lat, lng, popup = "") {
    const marker = { lat, lng, popup };
    this.markers.push(marker);
    this._render();
    return { remove: () => this._removeMarker(marker) };
  }

  _removeMarker(marker) {
    this.markers = this.markers.filter((m) => m !== marker);
    this._render();
  }
}
