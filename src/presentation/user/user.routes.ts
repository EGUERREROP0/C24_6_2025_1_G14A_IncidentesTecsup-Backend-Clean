import { Router } from "express";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { CloudinaryService } from "../../lib/claudinary.service";

export class UserRoutes {
  public static get routes(): Router {
    const router = Router();

    //Servide instance
    const userService = new UserService();
    const cloudinaryService = new CloudinaryService();

    //Controller instance
    const userController = new UserController(userService, cloudinaryService);

    //Routes of controller

    router.get(
      "/profile",
      [AuthMiddleware.validateJWT],
      userController.getProfileUser
    );

    router.put(
      "/profile-image",
      [AuthMiddleware.validateJWT],
      userController.updateProfileUserOnlyPhoto
    )

    router.put(
      "/profile-all",
      [AuthMiddleware.validateJWT],
      userController.updateProfileUser
    );

    
    router.get(
      "/",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.getAllUsers
    );

    router.get(
      "/admins-secondary",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.getAdmins
    );

    
    
    //Convert user to admin
    router.put("/convert_to_admin/:id", [
      AuthMiddleware.validateJWT,
      AuthMiddleware.verifyIsSuperAdmin,
      userController.convertUserToAdmin,
    ]);
    
    router.get(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.getUserById
    );

    router.put(
      "/admin/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.updateAdmin
    );
    

    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      userController.deleteUserById
    );

    
    
    return router;
  }
}
