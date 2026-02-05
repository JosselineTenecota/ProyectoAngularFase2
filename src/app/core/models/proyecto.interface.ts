export interface Proyecto {
    codigo?: number; // <--- Asegúrate de que esta línea exista
    titulo: string;
    descripcion: string;
    tipo: string;
    participacion: string;
    tecnologias: string;
    urlRepo?: string;
    urlDeploy?: string;
}