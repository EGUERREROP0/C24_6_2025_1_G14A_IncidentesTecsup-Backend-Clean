export class CreateincidentDto {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly image_url: string,
    public readonly priority: "Alta" | "Media" | "Baja",
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
    // console.log(location)
    // console.log("location", JSON.parse(location));

    if (!title) return ["El titulo es requerido", undefined];
    if (!description) return ["La descripcion es requerida", undefined];
    if (!image_url) return ["La imagen es requerida", undefined];
    if (!priority) return ["La prioridad es requerida", undefined];
    if (!type_id) return ["El tipo es requerido", undefined];

    if (typeof location !== "object" || location === null)
      return ["Ubicacion invalida (No es un Object)", undefined];

    //const location1 = JSON.parse(location);

    if (!location.latitude) return ["La latitud es requerida", undefined];
    if (!location.longitude) return ["La longitud es requerida", undefined];
    if (!location.altitude) return ["La altitud es requerida", undefined];
    if (typeof location.latitude !== "number")
      return ["La latitud no es un numero", undefined];
    if (typeof location.longitude !== "number")
      return ["La longitud no es un numero", undefined];
    if (typeof location.altitude !== "number")
      return ["La altitud no es un numero", undefined];
    if (location.latitude < -90 || location.latitude > 90)
      return ["La latitud no es valida", undefined];

    // console.log("location1 desde el dto", location1);
    return [
      undefined,
      new CreateincidentDto(
        title,
        description,
        image_url,
        priority,
        type_id,
        location
      ),
    ];
  }
}
