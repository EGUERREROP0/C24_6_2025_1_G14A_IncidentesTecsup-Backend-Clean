import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../domain/error";
import { Jwt } from "../../config";
import { UserModel } from "../../data/postgres/prisma";
import { UserEntity } from "../../domain";

export class AuthMiddleware {
  constructor() {}

  public static async validateJWT(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authorization = req.header("Authorization");
    if (!authorization) {
      return res.status(401).json({ error: "No token provided" });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Invalid token format" });
    }
    const token = authorization.split(" ").at(1); // || '';
    if (!token) return res.status(401).json({ error: "No token provided" });

    try {
      const payload = await Jwt.validateToken<{ id: string }>(token);
      if (!payload) return res.status(401).json({ error: "Invalid token" });

      const user = await UserModel.findFirst({
        where: { id: +payload.id },
      });
      if (!user) return res.status(401).json({ error: "Invalid token", user });

      req.body.user = UserEntity.fromObject(user);

      next();
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer("Internal server Error");
    }
  }
}
