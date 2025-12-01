import { Injectable, EventEmitter, Output } from '@angular/core';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { getCenter } from 'ol/extent';
import { getArea, getLength } from 'ol/sphere';
import { MapInitService } from './map.service';
import { Style, Stroke, Fill, Circle, Text } from 'ol/style';
import Collection from 'ol/Collection';
import { doubleClick, always } from 'ol/events/condition';
@Injectable({ providedIn: 'root' })
export class DrawService {
  draw!: Draw;
  sekliDegitir: Modify | null = null;
  labelFeature: Feature | null = null;

  @Output() parselCizildi = new EventEmitter<Feature>();
  @Output() olcumCizildi = new EventEmitter<{ feature: Feature, type: string }>();
  constructor(private mapInit: MapInitService) { }


  islemSecBasla(type: 'point' | 'line' | 'area', parselModu: boolean = false) {
    this.cizimUzerindekiCircleTemizle();

    if (this.draw) {
      this.mapInit.map.removeInteraction(this.draw);
    }



    this.draw = new Draw({
      source: this.mapInit.vectorSource,
      type: type === 'point' ? 'Point' : type === 'line' ? 'LineString' : 'Polygon',
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 0, 0.2)' }),
        stroke: new Stroke({ color: '#000', width: 2 }),
        image: new Circle({ radius: 7, fill: new Fill({ color: '#000' }) }),

      })
    });

    this.mapInit.map.addInteraction(this.draw);

    //çizdikten sonra neler olacak burda topla
    this.draw.on('drawend', (evt) => {
      const feature = evt.feature;
      const geom = feature.getGeometry()!;
      feature.set('type', type);

      const uzunluk = type === 'line' ? getLength(geom) : undefined;
      const alan = type === 'area' ? getArea(geom) : undefined;


      this.olcumleriMetinOlarakEkle(feature, type, uzunluk, alan);

      if (!parselModu) {
        this.olcumCizildi.emit({ feature, type });
      }
      if (parselModu && type === 'area') {
        this.parselCizildi.emit(feature);
      }

      this.mapInit.map.removeInteraction(this.draw);
      this.draw = null as any;


    });

  }

  olcumleriMetinOlarakEkle(feature: Feature, type: string, uzunluk?: number, alan?: number) {
    let metin = '';
    if (type === 'line' && uzunluk !== undefined) {
      metin = `${uzunluk.toFixed(2)} m`;
    } else if (type === 'area' && alan !== undefined) {
      metin = `${alan.toFixed(2)} m²`;
    }
    if (!metin) return;

    const geom = feature.getGeometry()!;
    const center = getCenter(geom.getExtent());

    this.labelFeature = new Feature({
      geometry: new Point(center)
    });

    this.labelFeature.setStyle(new Style({
      text: new Text({
        text: metin,
        font: '14px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        backgroundFill: new Fill({ color: 'rgba(255,255,255,0.9)' }),
        padding: [3, 6, 3, 6],
        offsetY: 0
      })
    }));

    this.labelFeature.set('label', feature);

    this.mapInit.vectorSource.addFeature(this.labelFeature);  //labeli ekliyoruz kaç metre oluğunu görmek için
  }

  cizimUzerindekiCircle(feature: Feature) { //çizime tıkladığımızda çizgi üzerinde circle geliyor şekli değiştirmede yardımcı
    this.cizimUzerindekiCircleTemizle();
    this.sekliDegitir = new Modify({
      features: new Collection([feature]),
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: 'red' })
        })
      })
    });
    this.mapInit.map.addInteraction(this.sekliDegitir); //
  }

  cizimUzerindekiCircleTemizle() { //circle yi kaldırıyor
    if (this.sekliDegitir) {
      this.mapInit.map.removeInteraction(this.sekliDegitir);
      this.sekliDegitir = null;
    }
  }
}
