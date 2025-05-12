import { regularExps } from "../../../config";

export class RegisterAdminDto {
  constructor(
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly incident_type_id: number
  ) {}

  static creare(object: { [key: string]: any }): [string?, RegisterAdminDto?] {
    const { first_name, last_name, email, password, incident_type_id } = object;

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
    if (!incident_type_id)
      return ["El tipo de incidente es requerido", undefined];

    return [
      undefined,
      new RegisterAdminDto(
        first_name,
        last_name,
        email,
        password,
        incident_type_id
      ),
    ];
  }
}
