
import { Injectable } from '@angular/core';
import GeoJSON from 'ol/format/GeoJSON';
import { MapInitService } from './map.service';
import { DrawService } from './draw.service';
import { getArea, getLength } from 'ol/sphere';
import Feature from 'ol/Feature';

@Injectable({ providedIn: 'root' })
export class MeasurementService {

  constructor(
    private mapInit: MapInitService,
    private draw: DrawService
  ) { }

  async islemiKaydet(feature: Feature, type: string) {
    const geom = feature.getGeometry();
    const geojson = new GeoJSON().writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    const payload = {
      type: type,
      geometry: JSON.stringify(geojson.geometry),
      properties: JSON.stringify({
        kaydetme_zamani: new Date().toISOString(),
        uzunluk_m: type === 'line' ? getLength(geom!) : null,
        alan_m2: type === 'area' ? getArea(geom!) : null
      })
    };

    try {
      const res = await fetch('https://localhost:7013/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        feature.set('id', data.id);
        feature.set('type', type);
      }
    } catch (err) {
      console.error('Kaydetme hatası:', err);
    }
  }

  async sil(id: number, feature: Feature) {

    if (!id || !feature) return;
    try {
      const res = await fetch(`https://localhost:7013/api/measurements/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(res.statusText)
      }

      const source = this.mapInit.getVectorSource();

      source.removeFeature(feature);
      const tumFeature = source.getFeatures();
      const labelFeature = tumFeature.find(f => f.get('label') === feature);

      if (labelFeature) {
        source.removeFeature(labelFeature);
        }
        this.draw.cizimUzerindekiCircleTemizle();
      
    } catch (err) {
      console.error('Silme hatası:', err);
    }
  }

  async guncelle(id: number, feature: Feature) {
    const type = feature.get('type') as string;
    const geom = feature.getGeometry()!;
    const geojson = new GeoJSON().writeFeatureObject(feature, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });

    const payload = {
      type: type,
      geometry: JSON.stringify(geojson.geometry),
      properties: JSON.stringify({
        kaydetme_zamani: new Date().toISOString(),
        uzunluk_m: type === 'line' ? getLength(geom) : null,
        alan_m2: type === 'area' ? getArea(geom) : null
      })
    };

    try {
      const res = await fetch(`https://localhost:7013/api/measurements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.kaydedilenIslemiYukle();
      }
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  }

  async kaydedilenIslemiYukle() {
    try {
      const res = await fetch('https://localhost:7013/api/measurements');
      const data = await res.json();
      this.mapInit.getVectorSource().clear();

      data.forEach((item: any) => {
        const geomObj = JSON.parse(item.geom);
        const format = new GeoJSON();
        const geometry = format.readGeometry(geomObj, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        });

        const feature = new Feature(geometry);
        feature.set('id', item.id);
        feature.set('type', item.type);

        const props = JSON.parse(item.properties || '{}');
        const uzunluk = props['uzunluk_m'];
        const alan = props['alan_m2'];
        this.draw.cizimUzerindekiCircleTemizle();
        this.draw.olcumleriMetinOlarakEkle(feature, item.type, uzunluk, alan);
        this.mapInit.getVectorSource().addFeature(feature);
      });
    } catch (err) {
      console.error('Yükleme hatası:', err);
    }
  }
}
