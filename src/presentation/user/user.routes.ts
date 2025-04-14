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
    router.get("/", [AuthMiddleware.validateJWT], userController.getAllUsers);
    router.get(
      "/:id",
      [AuthMiddleware.validateJWT],
      userController.getUserById
    );

    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT],
      userController.deleteUserById
    );
    return router;
  }
}
