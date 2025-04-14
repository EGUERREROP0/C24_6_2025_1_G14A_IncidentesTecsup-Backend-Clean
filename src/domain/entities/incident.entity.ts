enum priority_enum {
  low,
  medium,
  high,
}

export class IncidentEntity {
  private constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly image_url: string,
    public readonly priority: priority_enum,
    public readonly report_date: Date,
    public readonly close_date?: Date,
    public readonly user_id?: number,
    public readonly type_id?: number,
    public readonly status_id?: number,
    public readonly location_id?: number
  ) {}

  static fromObject(object: { [key: string]: any }): IncidentEntity {
    const {
      id,
      title,
      description,
      image_url,
      priority,
      report_date,
      close_date,
      user_id,
      type_id,
      status_id,
      location_id,
    } = object;

    return new IncidentEntity(
      id,
      title,
      description,
      image_url,
      priority,
      report_date,
      close_date,
      user_id,
      type_id,
      status_id,
      location_id
    );
  }
}
