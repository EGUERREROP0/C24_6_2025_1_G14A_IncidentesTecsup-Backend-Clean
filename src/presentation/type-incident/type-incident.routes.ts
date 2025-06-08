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

    router.post(
      "/",
      //  [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      typeIncidentController.createTypeIncident
    );

    router.put(
      "/:id",
      // [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      typeIncidentController.updateTypeIncident
    );

    router.get(
      "/",
      // [AuthMiddleware.validateJWT],
      typeIncidentController.getAllTypeIncidents
    );
    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      typeIncidentController.deleteTypeIncident
    );
    // router.get("/:id", typeIncidentController.getTypeIncidentById);

    return router;
  }
}
