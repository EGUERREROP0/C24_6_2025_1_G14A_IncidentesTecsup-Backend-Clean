export class UpdateAdminDto {
  private constructor(
    public readonly id: number,
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly email: string,
    public readonly incident_type_id: number
  ) {}

  static create(obj: any): [string?, UpdateAdminDto?] {
    const { id, first_name, last_name, email, incident_type_id } = obj;

    if (!id || isNaN(+id)) return ["ID inválido"];
    if (!first_name || !last_name || !email)
      return ["Campos obligatorios faltantes"];
    if (!incident_type_id || isNaN(+incident_type_id))
      return ["Tipo de incidente inválido"];

    return [
      undefined,
      new UpdateAdminDto(+id, first_name, last_name, email, +incident_type_id),
    ];
  }
}
