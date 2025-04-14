export class RoleEntity {
  private constructor(private id: number, public name: string) {}

  public static fromObject(object: { [key: string]: any }): RoleEntity {
    const { id, name } = object;
    return new RoleEntity(id, name);
  }
}
