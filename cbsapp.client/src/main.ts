import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';  // app.ts → app.ts
import { provideRouter } from '@angular/router';
import { routes } from './app/appRouting';
import { provideHttpClient } from '@angular/common/http'; // EKLENDİ!

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()]
})
  .catch(err => console.error(err));



//AppComponent bileşenini kök(root) bileşen olarak belirler.

//bootstrapApplication fonksiyonu ile Angular uygulamasını başlatır.

//providers kısmında servisler(örneğin HttpClient, Router, özel servisler vs.) global olarak tanımlanabilir.

//Eğer başlatma sırasında bir hata olursa, console.error ile konsola basılır.
