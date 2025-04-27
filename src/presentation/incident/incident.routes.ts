import { Router } from "express";
import { IncidentController } from "./incident.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { IncidentService } from "./incident.service";
import { CloudinaryService } from "../../lib/claudinary.service";

export class IncidentRoutes {
  constructor() {}

  public static get routes(): Router {
    const router = Router();

    const cloudinaryService = new CloudinaryService();
    const incidentService = new IncidentService(cloudinaryService);
    const incidenteController = new IncidentController(
      incidentService,
      cloudinaryService
    );

    // router.use(AuthMiddleware.validateJWT);

    router.post(
      "/",
      [AuthMiddleware.validateJWT],
      incidenteController.createIncident
    );
    router.get(
      "/",
      [AuthMiddleware.validateJWT, AuthMiddleware.verifyIsSuperAdmin],
      incidenteController.getAllIncidents
    );

    router.get(
      "/user",
      [AuthMiddleware.validateJWT],
      incidenteController.getIncidentsByUser
    );

    //TODO: Implementar
    router.get("/:id");
    router.put("/:id");

    
    router.delete(
      "/:id",
      [AuthMiddleware.validateJWT],
      incidenteController.deleteIncident
    );

    router.get("/location/:id");

    return router;
  }
}
