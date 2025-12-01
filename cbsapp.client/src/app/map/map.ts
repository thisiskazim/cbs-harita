// map.ts
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, Fill, Circle, Text } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { getArea, getLength } from 'ol/sphere';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { click } from 'ol/events/condition';
import Collection from 'ol/Collection';
import { Draw, Select, Modify } from 'ol/interaction';
import { CommonModule } from '@angular/common';
import { getCenter } from 'ol/extent';
import { Injectable, Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapInitService } from './Service/map.service';
import { DrawService } from './Service/draw.service';
import { MeasurementService } from './Service/measurement.service';
import { ParcelService } from './Service/parcel.service';

import Polygon from 'ol/geom/Polygon';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
  imports: [CommonModule, FormsModule]
})

export class MapComponent implements OnInit, AfterViewInit {

  @ViewChild('map', { static: true }) mapElement!: ElementRef;

  selectedFeature: Feature | null = null;
  selectedId: number | null = null;
  parselFormGoster = false;
  tempParcelFeature: Feature<Polygon> | null = null;
  parselModu = false;

  parselPropertyleri = { sehir: '', ilce: '', mahalle: '', ada: '', parsel: '' };

  constructor(
    private mapInit: MapInitService,
    private draw: DrawService,
    private measurement: MeasurementService,
    private parcel: ParcelService
  ) { }

  ngOnInit(): void {
    this.draw.parselCizildi.subscribe(feature => {
      this.tempParcelFeature = feature as Feature<Polygon>;
      this.parselFormGoster = true;
      this.parselModu = false;
    });
    //bunları draw içerisine event olarak gönderiyoruz abone oluyoruz?

    this.draw.olcumCizildi.subscribe(({ feature, type }) => {
      this.measurement.islemiKaydet(feature, type);
    });
  }

  ngAfterViewInit(): void {
    this.mapInit.initMap(); // target artık otomatik 'map' div’i

    //çizim üzerinde seçim yaptığımızda
    this.mapInit.select.on('select', (e) => {
      const selected = e.selected[0];
      this.selectedFeature = selected || null;
      this.selectedId = this.selectedFeature?.get('id') ?? null;

      // Sadece seçilen şey bir ölçüm veya parsel ise modify açılsın
      if (selected && (selected.get('type') === 'line' || selected.get('type') === 'area')) {
        this.draw.cizimUzerindekiCircle(selected);

        // cizimi değiştirdiğinde ne yapacak güncelleyecek ama parsel güncelleme yok !!!
        this.draw.sekliDegitir?.on('modifyend', () => {
          if (this.selectedId && this.selectedFeature) {
            this.measurement.guncelle(this.selectedId, this.selectedFeature);
          }
        });
      } else {

        this.draw.cizimUzerindekiCircleTemizle();
      }
    });
    this.measurement.kaydedilenIslemiYukle();

  }

  // Butonlar
  alanOlcmeBasla() { this.draw.islemSecBasla('area'); }
  uzunlukOlcmeBasla() { this.draw.islemSecBasla('line'); }
  isaretlemeYapBasla() { this.draw.islemSecBasla('point'); }
  parselEklemeBasla() {
    this.parselModu = true; this.draw.islemSecBasla('area', true);
  }
  sil() {
    if (!this.selectedFeature) {
      return;
    }
    const type = this.selectedFeature.get('type');
    const id = this.selectedFeature.get('id');

    //ölçüm sil
    if (type === 'area' || type === 'line' || type === 'point') {
      {
        if (this.draw.labelFeature) {
          this.mapInit.vectorSource.removeFeature(this.draw.labelFeature);
        }
        this.measurement.sil(id, this.selectedFeature);
        this.selectedFeature = null;
        this.selectedId = null;

      }
      return;
    }

    //Parsel sil
    const parselFeatures = this.mapInit.adaParselLayerSource.getFeatures();
    const buParselMi = parselFeatures.some(f => f === this.selectedFeature);

    if (buParselMi) {
      if (this.draw.labelFeature) {
        this.mapInit.vectorSource.removeFeature(this.draw.labelFeature);
      }
      this.parcel.sil(id);
      this.selectedFeature = null;
      this.selectedId = null;

      return;
    }


  }


  parselIptal() {
    this.parselFormGoster = false;
    this.parcel.parselIptal(this.tempParcelFeature, this.draw.labelFeature);
  }

  async parselKaydet() {
    if (!this.tempParcelFeature) return;

    await this.parcel.parselKaydet(
      this.tempParcelFeature,
      this.parselPropertyleri,
      this.draw.labelFeature,
      () => {
        this.parselFormGoster = false;
        this.tempParcelFeature = null;
        this.draw.labelFeature = null;
      }
    );
  }

  async parselAra() {
    await this.parcel.parselAra(this.parselPropertyleri);
  }

}
