import { IncidentTypeAdminModel, UserModel } from "../../data/postgres/prisma";
import { RegisterUserDto, UserEntity, LoginUserDto } from "../../domain";
import { CustomError } from "../../domain/error";
import { Bcrypt, envs, Jwt } from "../../config";
import { RegisterAdminDto } from "../../domain/dtos/auth/register-admin.dto";
import { EmailService } from "../../lib/email.service";
import { env } from "process";

export class AuthService {
  constructor(private readonly emailService:EmailService) {}

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
      //?Email confirmado
      this.sendEmailValidationLink(user.email)

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
      
      return { user: userEntity, token: token };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer("Error en el servidor");
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

    //? Validar si el usurio confirmó su email
    if (!user.email_validated) {
      throw CustomError.badRequest(
        "El email no ha sido validado, por favor revisa tu bandeja de entrada"
      );
    }

    const isMatch = Bcrypt.compare(loginUserDto.password, user.password);

    if (!isMatch) throw CustomError.badRequest("El password es incorrecto!");

    try {
      // GUARDAR EL TOKEN FCM SI ESTÁ PRESENTE
      if (loginUserDto.fcm_token) {
        await UserModel.update({
          where: { id: user.id },
          data: { fcm_token: loginUserDto.fcm_token },
        });
      }
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


  private sendEmailValidationLink= async(email: string) =>{
    const token = await Jwt.generateToken({ email, duration: "1h" });

    if (!token) throw CustomError.internalServer("Error al generar el token");
    const link = `${envs.API_URL}/auth/validate-email/${token}`;

    const html = `
      <h1>Bienvenido a nuestra plataforma</h1>
      <p>Hola, comprueba tu cuenta en REPORTEC</p>
      <p>Por favor, haz clic en el siguiente enlace para validar tu email:</p>
      
      <a href="${link}" style="
        display: inline-block;
        padding: 12px 24px;
        margin: 16px 0;
        background-color: #007BFF;
        color: #ffffff;
        text-decoration: none;
        font-weight: bold;
        border-radius: 6px;
        font-family: Arial, sans-serif;
        transition: background-color 0.3s ease; ">
        Validar Email
      </a>

      <p>Si no has creado una cuenta, por favor ignora este mensaje.</p>
    `;

    const options = {
      to: email,
      subject: "Validación de Email",
      htmlBody: html,
    }

    const isSet = await this.emailService.sendEmail(options);
    if (!isSet)  throw CustomError.internalServer("Error al enviar el email de validación");
    
    return true;
  }

  public async validateEmail(token: string) {
    if (!token) {
      throw CustomError.badRequest("Token is required");
    }

    const payload = await Jwt.validateToken(token);
    if (!payload) {
      throw CustomError.unauthorized("Token inválido o expirado");
    }

    const { email } = payload as { email: string };
    if (!email)  throw CustomError.internalServer("Email no encontrado en el token");

    // Actualizar estado de email usuario
    const user = await UserModel.findFirst({ where: { email } });
    if (!user) throw CustomError.internalServer("Usuario no encontrado");
    

    // Actualizar estado de verificacion
    await UserModel.update({
      where: { id: user.id },
      data: { email_validated: true },
    });

    return { message: "Email validado correctamente" };
  }
}
