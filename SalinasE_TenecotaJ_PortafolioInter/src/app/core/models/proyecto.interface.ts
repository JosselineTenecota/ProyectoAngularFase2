export interface Proyecto {
  id?: string;
  programmerId: string;
  titulo: string;
  descripcion: string;
  tipo: 'Academico' | 'Laboral';
  participacion: 'Frontend' | 'Backend' | 'Base de Datos'; 
  tecnologias: string;
  repoUrl?: string;
  demoUrl?: string;
}