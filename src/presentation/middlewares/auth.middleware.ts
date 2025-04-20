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
      const payload = await Jwt.validateToken<{ id: string; role_id: string }>(
        token
      );
      //console.log(payload, "Payload from middleware");
      if (!payload) return res.status(401).json({ error: "Invalid token" });

      const user = await UserModel.findFirst({
        where: { id: +payload.id },
        include: { user_role: true },
      });
      if (!user) return res.status(401).json({ error: "Invalid token", user });

      req.body.user = UserEntity.fromObject(user);
      //req.body.role = payload.role_id;
      (req as any).userRoleId = +payload.role_id;
      //console.log(req.body);

      next();
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer("Internal server Error");
    }
  }

  static verifyIsSuperAdmin(req: Request, res: Response, next: NextFunction) {
    const roleId = (req as any).userRoleId;
    if (roleId !== 3) {
      return res
        .status(403)
        .json({ error: "UnAuthorized access denied only SuperAdmin" });
    }
    next();
  }

  static verifyIsAdmin(req: Request, res: Response, next: NextFunction) {
    const roleId = (req as any).userRoleId;
    if (roleId !== 2 && roleId !== 3) {
      return res
        .status(403)
        .json({ error: "UnAuthorized access denied only Admin" });
    }
    next();
  }
}
