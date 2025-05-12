import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

export class AuthRoutes {
  public static get routes(): Router {
    const router = Router();

    //Servide instance
    const authService = new AuthService();

    //Controller instance
    const authController = new AuthController(authService);

    //Routes of controller
    router.post("/login", authController.loginUser);
    router.post("/register", authController.registerUser);
    router.post("/register-admin", authController.registerAdmin);

    //Validate token with Email
    router.get("/validate-email/:token", authController.ValidateEmail);

    return router;
  }
}
