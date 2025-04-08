import jwt, { SignOptions } from "jsonwebtoken";
import { envs } from "../plugins";

//Evitar dependencias ocultas
let JWT_SEED = envs.JWT_SEED;

export class Jwt {
  static async generateToken(payload: any, duration: string = "2h") {
    return new Promise((resolve) => {
      jwt.sign(
        payload,
        JWT_SEED,
        { expiresIn: duration } as SignOptions,
        (error, token) => {
          if (error) return resolve(null);
          resolve(token);
        }
      );
    });
  }

  static async verifyToken(token: string) {
    return;
  }
}
