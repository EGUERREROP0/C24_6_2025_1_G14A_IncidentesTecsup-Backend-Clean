export enum RoleEnum {
  MANAGER_ROLE = "MANAGER_ROLE",
  EMPLOYEE_ROLE = "EMPLOYEE_ROLE",
}

export class RoleEntity {
  private constructor(private id: number, public name: RoleEnum) {}

  public static fromObject(object: { [key: string]: any }): RoleEntity {
    const { id, name } = object;
    return new RoleEntity(id, name);
  }
}
