import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { LocationModel } from "../../data/postgres/prisma";
import { LocationController } from "./location.controller";

export class LocationRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    // const locationService = new LocationService();
    // const locationController = new LocationController(locationService);
    const locationController = new LocationController()
    router.get("/", locationController.getAllLocations);

    return router;
  }
}
