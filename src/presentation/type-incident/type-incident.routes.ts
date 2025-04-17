import { Router } from "express";
import { TypeIncidentController } from "./type-incident.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { TypeIncidentService } from "./type-incident.service";

export class typeIncidentRoutes {
  static get routes(): Router {
    const router = Router();

    const typeIncidentService = new TypeIncidentService();
    const typeIncidentController = new TypeIncidentController(
      typeIncidentService
    );

    router.get(
      "/",
      [AuthMiddleware.validateJWT],
      typeIncidentController.getAllTypeIncidents
    );
    // router.get("/", typeIncidentController.getAllTypeIncidents);
    // router.get("/:id", typeIncidentController.getTypeIncidentById);

    return router;
  }
}
