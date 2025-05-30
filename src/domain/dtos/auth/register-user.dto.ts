import { regularExps } from "../../../config";
import { isStrongPassword } from "../../../config/plugins/regular-exp";

export class RegisterUserDto {
  constructor(
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static creare(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { first_name, last_name, email, password } = object;

    /*if (
      [first_name, last_name, email, password].some(
        (field) => field.trim() === ""
      )
    ) {
      return ["Alguno de los campos esta vacios", undefined];
    }*/
    if (!first_name) return ["El nombre es requerido", undefined];
    if (!last_name) return ["El apellido es requerido", undefined];
    if (!email) return ["El email es requerido", undefined];
    if (!regularExps.email.test(email))
      return ["El email es invalido", undefined];
    if (!password) return ["La contraseña es requerida", undefined];
    if (password.length < 6) return ["Contraseña muy corta", undefined];
    if (!isStrongPassword(password)) return ["Contraseña no segura", undefined];

    return [
      undefined,
      new RegisterUserDto(first_name, last_name, email, password),
    ];
  }
}
