export class CreateincidentDto {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly image_url: string,
    public readonly priority: "low" | "medium" | "high",
    public readonly type_id: number,
    public readonly location: {
      latitude: number;
      longitude: number;
      altitude: number;
    }
  ) {}

  static create(object: { [key: string]: any }): [string?, CreateincidentDto?] {
    const { title, description, image_url, priority, type_id, location } =
      object;
    console.log("location", JSON.parse(location));

    if (!title) return ["El titulo es requerido", undefined];
    if (!description) return ["La descripcion es requerida", undefined];
    if (!image_url) return ["La imagen es requerida", undefined];
    if (!priority) return ["La prioridad es requerida", undefined];
    if (!type_id) return ["El tipo es requerido", undefined];
    if (typeof JSON.parse(location) !== "object")
      return ["Ubicacion invalida (No es un objeto)", undefined];

    const location1 = JSON.parse(location);

    if (!location1.latitude) return ["La latitud es requerida", undefined];
    if (!location1.longitude) return ["La longitud es requerida", undefined];
    if (!location1.altitude) return ["La altitud es requerida", undefined];
    if (typeof location1.latitude !== "number")
      return ["La latitud no es un numero", undefined];
    if (typeof location1.longitude !== "number")
      return ["La longitud no es un numero", undefined];
    if (typeof location1.altitude !== "number")
      return ["La altitud no es un numero", undefined];
    if (location1.latitude < -90 || location1.latitude > 90)
      return ["La latitud no es valida", undefined];

    return [
      undefined,
      new CreateincidentDto(
        title,
        description,
        image_url,
        priority,
        type_id,
        location1
      ),
    ];
  }
}
