import { Request, Response } from "express";
import { json } from "stream/consumers";
import { LoginUserDto, RegisterUserDto } from "../../domain";
import { CustomError } from "../../domain/error";
import { AuthService } from "./auth.service";
import { RegisterAdminDto } from "../../domain/dtos/auth/register-admin.dto";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  registerUser = async (req: Request, res: Response) => {
    const [error, registerUserDto] = RegisterUserDto.creare(req.body);
    if (error) return res.status(400).json({ error });

    this.authService
      .registerUser(registerUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  //TODO implementar
  registerAdmin = async (req: Request, res: Response) => {
    // const { first_name, last_name, email, password, incident_type_id } =
    //   req.body;

    // console.log(req.body);

    const [error, registerAdminDto] = RegisterAdminDto.creare(req.body);
    if (error) return res.status(400).json({ error });

    this.authService
      .registerAdmin(registerAdminDto!)
      .then((admin) => res.json(admin))
      .catch((error) => this.handleError(error, res));
  };

  loginUser = async (req: Request, res: Response) => {
    const [error, loginUserDto] = LoginUserDto.compare(req.body);
    if (error) return res.status(400).json({ error });

    this.authService
      .loginUser(loginUserDto!)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  //TODO implementar
  ValidateEmail = async (req: Request, res: Response) => {
    res.json({ msg: "validate" });
  };
}

//       const { password, ...userEntity } = UserEntity.fromObject(user);

//       const token = await Jwt.generateToken({
//         id: user.id,
//         role_id: user.role_id,
//       });
//       if (!token) throw CustomError.internalServer("Error el el servidor");
//       console.log({
//         user: userEntity,
//         token: token,
//         role: userEntity.user_role,
//       });

//       return { user: userEntity, token: token };
//     } catch (error) {
//       throw CustomError.internalServer(`${error}`);
//     }
//   }
