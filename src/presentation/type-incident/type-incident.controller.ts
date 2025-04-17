import { Request, Response } from "express";
import { TypeIncidentService } from "./type-incident.service";

export class TypeIncidentController {
  constructor(private typeIncidentService: TypeIncidentService) {}

  getAllTypeIncidents = async (req: Request, res: Response) => {
    this.typeIncidentService
      .getAllTypeIncidents()
      .then((typeIncidents) => res.status(200).json(typeIncidents))
      .catch((error) => {
        console.error("Error al obtener los tipos de incidentes:", error);
      });
  };

}
