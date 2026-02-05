export interface Proyecto {
  codigo?: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  participacion: string;
  tecnologias: string;
  urlRepo?: string;
  urlDeploy?: string;
}