import { Router } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { EmailService } from "../../lib/email.service";
import { envs } from "../../config";

export class AuthRoutes {
  public static get routes(): Router {
    const router = Router();

    //! Create instances of services and controllers
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
    );

    //Servide instance
    const authService = new AuthService(emailService);

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
