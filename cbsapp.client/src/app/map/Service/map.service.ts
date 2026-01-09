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
import XYZ from 'ol/source/XYZ';
import ImageTile from 'ol/source/ImageTile';
import LayerGroup from 'ol/layer/Group';

@Injectable({ providedIn: 'root' })

export class MapInitService {
  private map!: Map;

  private vectorSource = new VectorSource(); //çizimleri barındır
  private vectorLayer!: VectorLayer<VectorSource>; //vectorsourcede olanları çizer

  private adaParselLayerSource = new VectorSource();
  private adaParselLayer!: VectorLayer<VectorSource>;

  private uyduLayer!: TileLayer;
  private sokakLayer!: TileLayer;

  private select!: Select;


  initMap() {
    this.vectorAdaParselLayerOlustur();
    this.sokakUyduLayerOlustur();
    this.mapOlustur();
   
    
    this.secimEtkilesimi();
}


  private mapOlustur(): void {
    const baseLayers = new LayerGroup({
      layers: [this.sokakLayer,this.uyduLayer]
    });


    this.map = new Map({
      target: 'map',
      layers: [baseLayers, this.vectorLayer, this.adaParselLayer],
      view: new View({
        center: fromLonLat([28.97, 41.01]),
        zoom: 12
      })
    });

  }

  private vectorAdaParselLayerOlustur(): void {

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 0, 0.2)' }),
        stroke: new Stroke({ color: '#000', width: 2 }),
        image: new Circle({ radius: 7, fill: new Fill({ color: '#000' }) })
      }),
      zIndex:1
    });

    this.adaParselLayer = new VectorLayer({
      source: this.adaParselLayerSource
    });

  }

  private sokakUyduLayerOlustur(): void {

    this.sokakLayer = new TileLayer({
      source: new OSM(),
      opacity: 0,
      visible: true,
     

    })
    this.sokakLayer.set('type', 'base');

    this.uyduLayer = new TileLayer({
      source: new ImageTile({
        attributions: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
          '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
        url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=RHCmCwstPA1SlzGDRCMM',
        tileSize: 512,
        maxZoom: 20,
      }),
      opacity: 1,
      visible: true,
    
    });
    this.uyduLayer.set('type', 'base');

  }

  private secimEtkilesimi(): void {

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




  //kapsülle
  getMap(): Map {
    return this.map;
  }

  getVectorSource(): VectorSource {
    return this.vectorSource;
  }

  getAdaParselSource(): VectorSource {
    return this.adaParselLayerSource;
  }

  getSecimEtkilesimi(): Select {
    return this.select;
  }

  getUyduLayer(): TileLayer {
    return this.uyduLayer;
  }
  getSokakLayer(): TileLayer {
    return this.sokakLayer;
  }

 

  }













