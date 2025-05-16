import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";

export class DashboardRouter {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const dashboardService = new DashboardService();
    const dashboardController = new DashboardController(dashboardService);

    router.get(
      "/resumen",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      dashboardController.getTotalIncidents
    );
    router.get(
      "/incdents-by-priority",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      dashboardController.countIncidentsByPriority
    );
    router.get(
      "/admin-incident-stats",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsAdmin],
      dashboardController.getAdminIncidentStats
    );

    router.get(
      "/users-to-excel",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      dashboardController.exportUsersToExcel
    );

    return router;
  }
}
