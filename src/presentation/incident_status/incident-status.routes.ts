import { Router } from "express";
import { IncidentStatusController } from "./incident-status.controller";
import { IncidentStatusService } from "./incident-status.service";

export class IncidentStatusRoutes {
  public static get routes(): Router {
    const router = Router();

    const incidentStatusService = new IncidentStatusService();
    const incidentStatusController = new IncidentStatusController(incidentStatusService)

    router.get("/", incidentStatusController.getAllIncidentStatuses);

    return router;
  }
}
