import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { LocationModel } from "../../data/postgres/prisma";

export class LocationRoutes {
  constructor() {}

  static get routes(): Router {
    const router = Router();

    // const locationService = new LocationService();
    // const locationController = new LocationController(locationService);

    router.get("/", async (req, res) => {
      const locations = await LocationModel.findMany({});

      res.status(200).json(locations);
    });

    return router;
  }
}
