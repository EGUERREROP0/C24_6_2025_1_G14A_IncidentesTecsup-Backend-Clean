export class AsignResponsabilityAdminDto {
  constructor(
    public readonly incident_type_id: number | string,
    public readonly id: number
  ) {}

  static compare(object: {
    [key: string]: any;
  }): [string?, AsignResponsabilityAdminDto?] {
    const { incident_type_id, id } = object;
    console.log(id);
    if (!incident_type_id) return ["ID del incidente es requerido", undefined];
    if (!id) return ["ID del ADMIN es requerido", undefined];

    return [undefined, new AsignResponsabilityAdminDto(incident_type_id, id)];
  }
}
