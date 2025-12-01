// services/parcel.service.ts
import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import { MapInitService } from './map.service';
import { DrawService } from './draw.service';
import WKT from 'ol/format/WKT';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class ParcelService {
    constructor(private mapInit: MapInitService, private draw: DrawService, private snackBar: MatSnackBar) { }

    parselIptal(tempParcelFeature: Feature | null, labelFeature: Feature | null) {
        if (tempParcelFeature && labelFeature) {
            this.mapInit.vectorSource.removeFeature(tempParcelFeature);
            this.mapInit.vectorSource.removeFeature(labelFeature);
        }
    }


    async parselKaydet(
        tempParcelFeature: Feature,
        parselPropertyleri: any,
        labelFeature: Feature | null,
        onSuccess: () => void
    ) {
        if (!tempParcelFeature) return;

        const geometry = tempParcelFeature.getGeometry()!;
        const wkt = new WKT().writeGeometry(geometry);


        try {
            const response = await fetch('https://localhost:7013/api/parcel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sehir: parselPropertyleri.sehir,
                    ilce: parselPropertyleri.ilce,
                    mahalle: parselPropertyleri.mahalle,
                    ada: parselPropertyleri.ada,
                    parsel: parselPropertyleri.parsel,
                    wkt: wkt
                })
            });

            if (response.status === 409) {//eklenecek 

                //this.snackBar.open(' Bu ada/parsel zaten kayıtlı!', 'Tamam', {
                //  duration: 5000,
                //  panelClass: ['red-snackbar'], 
                //  horizontalPosition: 'center',
                //  verticalPosition: 'bottom'
                //});
                alert('Bu kayıt zaten var');
            }
            else if (response.ok) {
                //bunları ekleyecem

                //  this.snackBar.open(' Parsel başarıyla kaydedildi!', 'Harika', {
                //  duration: 4000,
                //  panelClass: ['green-snackbar'],
                //  horizontalPosition: 'center',
                //  verticalPosition: 'bottom'
                //});

                this.mapInit.vectorSource.removeFeature(tempParcelFeature);
                if (labelFeature) {//kayıttan sonra labeli silelim
                    this.mapInit.vectorSource.removeFeature(labelFeature);
                }

                parselPropertyleri.ada = '';
                parselPropertyleri.parsel = '';

                onSuccess(); // formu kapat, state’i sıfırla

            }

        } catch (err) {
            console.error('hata', err);
        }
    }

    async parselAra(parselPropertyleri: any) {
        const { sehir, ilce, mahalle, ada, parsel } = parselPropertyleri;
        this.mapInit.adaParselLayerSource.clear();

        try {
            const url = `https://localhost:7013/api/parcel/search?sehir=${sehir}&ilce=${ilce}&mahalle=${mahalle}&ada=${ada}&parsel=${parsel}`;
            const res = await fetch(url);

            if (!res.ok) {
                alert('Parsel bulunamadı');
                return;
            }

            const data = await res.json();

            const geometry = new WKT().readGeometry(data.wkt);
            const feature = new Feature({ geometry });


            feature.set('id', data.id);

            feature.setStyle(
                new Style({
                    fill: new Fill({ color: 'rgba(255, 255, 0, 0.6)' }),
                    stroke: new Stroke({ color: '#ff0000', width: 3 }),
                    text: new Text({
                        text: `${ada}/${parsel}`,
                        font: 'bold 25px Arial',
                        fill: new Fill({ color: '#000' }),
                        stroke: new Stroke({ color: '#fff', width: 4 }),
                        offsetY: -15
                    })
                })
            );

            this.mapInit.adaParselLayerSource.addFeature(feature);


            const extent = geometry.getExtent();
            this.mapInit.map.getView().fit(extent, { duration: 1200, padding: [100, 100, 100, 100] });

        } catch (err) {
            console.error(err);
        }
    }

    async sil(parselId: number) {

        if (!parselId) return;

        try {
            const res = await fetch(`https://localhost:7013/api/parcel/${parselId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                this.mapInit.adaParselLayerSource.clear();

                this.draw.cizimUzerindekiCircleTemizle();
                alert('Parsel kalıcı olarak silindi');
            }
        } catch (err) {
            console.error(err);
        }
    }




}
