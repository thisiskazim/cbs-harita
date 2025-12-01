import { Injectable } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Circle from 'ol/style/Circle';
import { fromLonLat } from 'ol/proj';

@Injectable({ providedIn: 'root' })

export class MapInitService {
  map!: Map;
  vectorSource = new VectorSource();
  adaParselLayerSource = new VectorSource();
  adaParselLayer!: VectorLayer<VectorSource>;
  select!: Select;


  initMap() {
    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 0, 0.2)' }),
        stroke: new Stroke({ color: '#000', width: 2 }),
        image: new Circle({ radius: 7, fill: new Fill({ color: '#000' }) })
      })
    });

    this.adaParselLayer = new VectorLayer({
      source: this.adaParselLayerSource
    });

    this.map = new Map({
      target: 'map',
      layers: [new TileLayer({ source: new OSM() }), vectorLayer, this.adaParselLayer],
      view: new View({
        center: fromLonLat([28.97, 41.01]),
        zoom: 12
      })
    });


    this.select = new Select({
      condition: click,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.3)' }),
        stroke: new Stroke({ color: '#ff0000', width: 3 }),
        image: new Circle({ radius: 8, fill: new Fill({ color: '#ff0000' }) })
      })
    });
  this.map.addInteraction(this.select);
  }


}
