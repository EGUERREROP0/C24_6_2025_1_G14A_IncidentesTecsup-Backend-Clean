import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

export class AdminRoutes {
  public static get routes(): Router {
    const router = Router();
    const adminService = new AdminService();

    const adminController = new AdminController(adminService);

    //Asignar Responsabilidad  a Admin
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
