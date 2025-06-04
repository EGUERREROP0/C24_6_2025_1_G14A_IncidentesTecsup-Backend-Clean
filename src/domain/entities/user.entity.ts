import { CustomError } from "../error";
import { RoleEntity } from "./rele.entity";

export class UserEntity {
  private constructor(
    public readonly id: number,
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly email: string,
    public readonly password?: string,

    public readonly role_id?: number,
    public readonly email_validated?: boolean,
    public readonly profile_picture?: string,
    public readonly user_role?: string //RoleEntity
  ) {}

  static fromObject(object: { [key: string]: any }) {
    const {
      id,
      first_name,
      last_name,
      email,
      password,
      profile_picture,
      role_id,
      email_validated,
      user_role,
    } = object;

    if (!id) throw CustomError.badRequest("No se encontro el ID");
    if (!first_name) throw CustomError.badRequest("El nombre es requerido");
    if (!last_name) throw CustomError.badRequest("Apellido requerido");
    if (!email) throw CustomError.badRequest("Email requerido");
    // if (!profile_picture) throw CustomError.badRequest("Fotografia requerida");
    if (!password) throw CustomError.badRequest("Falta la contraseña");
    // if (!role_id) throw CustomError.badRequest("Falta el rol");
    if (email_validated === undefined)
      throw CustomError.badRequest("Falta la validacion de email");
    // if (!user_role) throw CustomError.badRequest("User role requerido");

    return new UserEntity(
      id,
      first_name,
      last_name,
      email,
      password,
      role_id,
      email_validated,
      profile_picture,
      user_role //? RoleEntity.fromObject(role_id) : undefined
    );
  }
}
