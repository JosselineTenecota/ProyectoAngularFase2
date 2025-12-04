export interface Proyecto {
  id?: string;
  programmerId: string;
  titulo: string;
  descripcion: string;
  tipo: 'Academico' | 'Laboral';
  participacion: 'Frontend' | 'Backend' | 'Base de Datos'; // <--- NUEVO CAMPO
  tecnologias: string;
  repoUrl?: string;
  demoUrl?: string;
}