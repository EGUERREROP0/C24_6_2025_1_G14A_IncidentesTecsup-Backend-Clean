import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

export class DashboardRouter {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    const dashboardService = new DashboardService();
    const dashboardController = new DashboardController(dashboardService);

    router.get("/resumen", dashboardController.getTotalIncidents);
    router.get("/resumen/excel", dashboardController.exportarUsuariosExcel);

    return router;
  }
}
