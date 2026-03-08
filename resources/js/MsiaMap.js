import { VectorMapCore } from "./VectorMapCore.js";
import "./VectorMapCore.css";
import malaysiaStatesData from "../data/malaysia-states.geojson?raw";

export default class MsiaMap {
  constructor(id, options = {}) {
    const geoData = options.geoData ? (typeof options.geoData === "string" ? JSON.parse(options.geoData) : options.geoData) : JSON.parse(malaysiaStatesData);

    this.map = new VectorMapCore(id, {
      geoData,
      center: options.center,
      zoom: options.zoom,
      onRegionClick: options.onRegionClick,
    });
  }

  addStateMarker(stateName, lat, lng) {
    return this.map.addMarker(lat, lng, stateName);
  }

  setView(center, zoom) {
    return this.map.setView(center, zoom);
  }

  onRegionClick(callback) {
    this.map.onRegionClick = callback;
  }
}
