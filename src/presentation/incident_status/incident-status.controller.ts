import { Request, Response } from "express";
import { IncidentStatusModel } from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";
import { IncidentStatusService } from "./incident-status.service";

export class IncidentStatusController {
  constructor(private readonly incidentStatusService: IncidentStatusService) {}

  //*Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  getAllIncidentStatuses = (req: Request, res: Response) => {
    
    this.incidentStatusService
      .getAllIncidentStatuses()
      .then((incidentStatus) => {
        return res.status(200).json(incidentStatus);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };
}
