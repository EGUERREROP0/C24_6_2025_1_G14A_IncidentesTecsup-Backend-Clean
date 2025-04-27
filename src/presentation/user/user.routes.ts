import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class UserRoutes {
  public static get routes(): Router {
    const router = Router();

    //Servide instance
    const userService = new UserService();

    //Controller instance
    const userController = new UserController(userService);

    //Routes of controller

    router.get(
      "/profile",
      [AuthMiddleware.validateJWT],
      userController.getProfileUser
    );

    router.get(
      "/",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.getAllUsers
    );
    router.get(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.getUserById
    );

    

    //Convert user to admin
    router.put("/convert_to_admin/:id", [
      AuthMiddleware.validateJWT,
      AuthMiddleware.verifyIsSuperAdmin,
      userController.convertUserToAdmin,
    ]);

    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.deleteUserById
    );
    return router;
  }
}
