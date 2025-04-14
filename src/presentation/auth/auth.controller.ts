import { Request, Response } from "express";
import { json } from "stream/consumers";
import { LoginUserDto, RegisterUserDto } from "../../domain";
import { CustomError } from "../../domain/error";
import { AuthService } from "./auth.service";

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
