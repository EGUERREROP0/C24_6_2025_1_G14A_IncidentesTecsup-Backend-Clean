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
