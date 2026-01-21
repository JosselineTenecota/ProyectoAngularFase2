import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app'; // O AppComponent, verifica el nombre

// Usamos la configuración centralizada
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));