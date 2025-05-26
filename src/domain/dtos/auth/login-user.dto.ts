import { regularExps } from "../../../config";

export class LoginUserDto {
  constructor(
    public readonly password: string,
    public readonly email: string,
    public readonly fcm_token?: string
  ) {}

  static compare(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { password, email, fcm_token } = object;

    console.log("object", object);
    console.log("fcm_token", fcm_token);

    if (!email) return ["Email es requerido", undefined];
    if (!regularExps.email.test(email))
      return ["El correo no es valido", undefined];
    if (!password) return ["La contraseña es requerida", undefined];
    if (password.length < 6) return ["La contraseña es muy corta", undefined];

    return [undefined, new LoginUserDto(password, email, fcm_token)];
  }
}
