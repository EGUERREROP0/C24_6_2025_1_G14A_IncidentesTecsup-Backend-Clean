import jwt, { SignOptions } from "jsonwebtoken";
import { envs } from "../plugins";

//Evitar dependencias ocultas
let JWT_SEED = envs.JWT_SEED;

export class Jwt {
  static async generateToken(payload: any, duration: string = "30d") {
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

  static async validateToken<T>(token: string): Promise<T | null> {
    if (!token) return null;

    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (error, decoded) => {
        if (error) return resolve(null);
        resolve(decoded as T);
      });
    });
  }
}
