import { IncidentTypeAdminModel, UserModel } from "../../data/postgres/prisma";
import { RegisterUserDto, UserEntity, LoginUserDto } from "../../domain";
import { CustomError } from "../../domain/error";
import { Bcrypt, Jwt } from "../../config";
import { RegisterAdminDto } from "../../domain/dtos/auth/register-admin.dto";

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

  // Regsiter Admin
  async registerAdmin(registerAdminDto: RegisterAdminDto) {
    const { email, incident_type_id } = registerAdminDto;

    const existEmail = await UserModel.findFirst({ where: { email } });

    if (existEmail) throw CustomError.badRequest("El email ya existe");
    if (!incident_type_id || isNaN(incident_type_id)) {
      throw CustomError.badRequest("Tipo de incidente inválido");
    }

    // const { incident_type_id: _, ...rest } = registerAdminDto;

    try {
      const newAdmin = await UserModel.create({
        data: {
          first_name: registerAdminDto.first_name,
          last_name: registerAdminDto.last_name,
          email: registerAdminDto.email,
          password: Bcrypt.hash(registerAdminDto.password),
          role_id: 2, // 1 --> Admin
          // user_role: {
          //   connect: { name: "admin" },
          // },
        },
        include: {
          user_role: true, //  Esto te trae el nombre del rol para incluirlo en la respuesta
        },
      });

      await IncidentTypeAdminModel.create({
        data: {
          admin_id: newAdmin.id,
          incident_type_id: +registerAdminDto!.incident_type_id,
        },
      });

      //Use Our Entity
      const { password, ...userEntity } = UserEntity.fromObject(newAdmin);

      const token = await Jwt.generateToken({
        id: newAdmin.id,
        role_id: newAdmin.role_id,
      });
      if (!token) throw CustomError.internalServer("Error el el servidor");
      console.log({
        user: userEntity,
        token: token,
        role: userEntity.user_role,
      });

      return { user: userEntity, token: token };
    } catch (error) {
      console.log(error);
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
