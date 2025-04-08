import { Router } from "express";
import { AuthRoutes } from "./auth/auth.routes";

export class AppRoutes {
  public static get routes(): Router {
    const router = Router();

    //Use all routes
    router.use("/api/v1/auth", AuthRoutes.routes);

    return router;
  }
}
