import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AdminController } from "./admin.controller";

export class AdminRoutes {
  public static get routes(): Router {
    const router = Router();

    const adminController = new AdminController();

    router.post(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      adminController.AsignResponsabilityAdmin
    );

    router.get(
      "/",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsAdmin],
      adminController.getIncidentsByAdminId
    );

    return router;
  }
}
