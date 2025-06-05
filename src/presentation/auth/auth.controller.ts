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
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    this.authService
      .validateEmail(token)
      .then((resp) => res.json(resp))
      .catch((error) => this.handleError(error, res));
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    this.authService
      .forgotPassword(email)
      .then((resp) => res.json(resp))
      .catch((error) => this.handleError(error, res));
  };

  checkPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    this.authService
      .checkPassword(token)
      .then((user) => res.json(user))
      .catch((error) => this.handleError(error, res));
  };

  newPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    this.authService
      .newPassword(token, password)
      .then((resp) => res.json(resp))
      .catch((error) => this.handleError(error, res));
  };
}
