import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { IncidentRoutes } from "./incident/incident.routes";
import { UserRoutes } from "./user/user.routes";
import { typeIncidentRoutes } from "./type-incident/type-incident.routes";
import { LocationRoutes } from "./location/location.routes";

export class AppRoutes {
  public static get routes(): Router {
    const router = Router();

    const prefix = process.env.API_PREFIX || "/api/v1";

    //Use all routes
    router.use(`${prefix}/auth`, AuthRoutes.routes);
    router.use(`${prefix}/incident`, IncidentRoutes.routes);
    router.use(`${prefix}/user`, UserRoutes.routes);
    router.use(`${prefix}/type-incident`, typeIncidentRoutes.routes);
    router.use(`${prefix}/location`, LocationRoutes.routes);

    return router;
  }
}
