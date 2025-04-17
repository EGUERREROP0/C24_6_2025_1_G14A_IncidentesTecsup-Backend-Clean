export class TypeIncidentEntity {
  private constructor(
    public readonly id: number,
    public readonly name: string
  ) {}

  static fromObject(object: { [key: string]: any }) {
    const { id, name } = object;

    if (!id) throw new Error("No se encontro el ID");
    if (!name) throw new Error("El nombre es requerido");
    return new TypeIncidentEntity(id, name);
  }
}
