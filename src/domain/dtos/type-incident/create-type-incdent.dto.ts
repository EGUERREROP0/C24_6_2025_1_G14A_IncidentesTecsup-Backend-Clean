export class TypeIncidentDto {
  constructor(public readonly name: string) {}

  static create(name: string): [string?, TypeIncidentDto?] {
    if (!name) return ["El nombre es requerido", undefined];
    if (typeof name !== "string")
      return ["El nombre no es un string", undefined];

    return [undefined, new TypeIncidentDto(name)];
  }
}
