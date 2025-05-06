import { UserModel } from "../../data/postgres/prisma";
import { RegisterUserDto, UserEntity, LoginUserDto } from "../../domain";
import { CustomError } from "../../domain/error";
import { Bcrypt, Jwt } from "../../config";

export class AuthService {
  constructor() {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email } = registerUserDto;

    const existEmail = await UserModel.findFirst({ where: { email } });

    if (existEmail) throw CustomError.badRequest("El email ya existe");

    try {
      const user = await UserModel.create({
        data: {
          ...registerUserDto!,
          password: Bcrypt.hash(registerUserDto.password),
          // user_role: {
          //   connect: { name: "user" },
          // },
        },
        include: {
          user_role: true, //  Esto te trae el nombre del rol para incluirlo en la respuesta
        },
      });

      // console.log({ user });

      //JWT --> Mantener autenticazion

      //Use Our Entity
      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await Jwt.generateToken({
        id: user.id,
        role_id: user.role_id,
      });
      if (!token) throw CustomError.internalServer("Error el el servidor");
      console.log({
        user: userEntity,
        token: token,
        role: userEntity.user_role,
      });

      return { user: userEntity, token: token };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  //LoginUser
  async loginUser(loginUserDto: LoginUserDto) {
    const user = await UserModel.findFirst({
      where: { email: loginUserDto.email },
      include: { user_role: true },
    });

    if (!user) throw CustomError.badRequest("El email no existe");
    if (!user.password)
      throw CustomError.badRequest("El password no esta definido");

    const isMatch = Bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) throw CustomError.badRequest("El password es incorrecto!");

    try {
      //Use Our Entity
      const { password, ...userEntity } = UserEntity.fromObject(user);
      // const { password, ...userEntity } = user;

      //Generar token
      const token = await Jwt.generateToken({
        id: user.id,
        role_id: user.role_id,
      });

      if (!token) throw CustomError.internalServer("Error en el servidor");

      return { user: userEntity, token: token, role: userEntity.user_role };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }
}
