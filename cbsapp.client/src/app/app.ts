
import { Component } from '@angular/core';
import { MapComponent } from './map/map';  
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
  imports: [RouterModule],
    templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {


}



