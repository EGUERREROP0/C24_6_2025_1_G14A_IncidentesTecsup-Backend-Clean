export class UpdateStatusIncidentDto {
  constructor(public readonly coment?: string) {}

  static create(object: {
    [key: string]: any;
  }): [string?, UpdateStatusIncidentDto?] {
    const {status_id, coment } = object;

    const needsComment = [3, 4].includes(+status_id);
    
    if (needsComment && (!coment || coment.trim() === "")) {
      return [
        "El comentario es requerido para estados 'resuelto' o 'cerrado'",
        undefined,
      ];
    }

    return [undefined, new UpdateStatusIncidentDto(coment)];
  }
}
