import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";
import { IncidentRoutes } from "./incident/incident.routes";
import { UserRoutes } from "./user/user.routes";

export class AppRoutes {
  public static get routes(): Router {
    const router = Router();

    //Use all routes
    router.use("/api/v1/auth", AuthRoutes.routes);
    router.use("/api/v1/incident", IncidentRoutes.routes);
    router.use("/api/v1/user", UserRoutes.routes);

    return router;
  }
}
