import { Router } from "express";
import { NotificationService } from "./notification.service";
import { NotificationController } from "./notification.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class NotificationRoutes {
  static get routes(): Router {
    const router = Router();

    const notificationService = new NotificationService();
    const notificationController = new NotificationController(
      notificationService
    );

    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      notificationController.getNotificationsByUser
    );

    return router;
  }
}
