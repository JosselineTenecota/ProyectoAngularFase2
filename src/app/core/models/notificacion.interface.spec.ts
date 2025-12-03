import { NotificacionesService } from '../services/notificaciones';
import { Notificacion } from './notificacion.interface';

describe('Notificacion', () => {
  it('should create an instance', () => {
    expect(new NotificacionesService()).toBeTruthy();
  });
});
