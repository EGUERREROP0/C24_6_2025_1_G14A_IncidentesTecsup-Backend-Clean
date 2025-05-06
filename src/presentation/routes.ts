import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { IncidentRoutes } from "./incident/incident.routes";
import { UserRoutes } from "./user/user.routes";
import { typeIncidentRoutes } from "./type-incident/type-incident.routes";
import { LocationRoutes } from "./location/location.routes";
import { AdminRoutes } from "./admin/admin.routes";
import { IncidentStatusRoutes } from "./incident_status/incident-status.routes";
import { DashboardRouter } from "./dashboard/dashboard.router";

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

    //Routes admin
    router.use(`${prefix}/admin`, AdminRoutes.routes);

    router.use(`${prefix}/incident-status`, IncidentStatusRoutes.routes);
    router.use(`${prefix}/dashboard`, DashboardRouter.routes);

    return router;
  }
}
