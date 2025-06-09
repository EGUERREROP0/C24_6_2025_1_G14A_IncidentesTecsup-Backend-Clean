import { Request, Response } from "express";
import { CustomError } from "../../domain/error";
import { CreateincidentDto, PaginationDto } from "../../domain";
import { IncidentService } from "./incident.service";
import { CloudinaryService } from "../../lib/claudinary.service";
import { stat } from "fs";
import { UpdateStatusIncidentDto } from "../../domain/dtos/incident/update_status-incident.dto";

export class IncidentController {
  constructor(
    private readonly incidentService: IncidentService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  //*Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  //!Creation of incident
  createIncident = async (req: Request, res: Response) => {
    const user = req.body.user;
    const file = (req as any).files?.image;
    const force = req.body.force === "true";

    this.incidentService
      .handleCreateIncident(req.body, user, file, force)
      // .createIncident(createIncidentDto!, user)
      .then((response) => {
        return res.status(200).json(response);
        //  Si fue duplicado, responder con advertencia
        /* if ("duplicado" in response && response.duplicado) {
          return res.status(200).json(response);
        }

        //  Si no fue duplicado, se guardó normalmente
        return res.status(200).json(response);*/
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //!Get all incidents
  getAllIncidents = async (req: Request, res: Response) => {
    //Get query params pagination
    const {
      page = 1,
      limit = 10,
      search = "",
      priority,
      status_id,
      type_id,
    } = req.query;

    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) return res.status(400).json({ error });
    if (search && typeof search !== "string")
      return res.status(400).json({ error: "El search debe ser un string" });

    const allowedPriorities = ["Alta", "Media", "Baja"] as const;
    const filters = {
      priority: allowedPriorities.includes(priority as any)
        ? (priority as (typeof allowedPriorities)[number])
        : undefined,
      // priority: typeof priority === "string" ? priority : undefined,
      status_id: status_id ? +status_id : undefined,
      type_id: type_id ? +type_id : undefined,
    };

    this.incidentService
      .getAllIncidents(paginationDto!, search as string, filters /*as object*/)
      .then((response) => res.status(200).json(response))
      .catch((error) => this.handleError(error, res));
  };

  getIncidentById = (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      return res.status(400).json({ error: `El id: ${id} no es valido` });

    this.incidentService
      .getIncidentById(id)
      .then((detail) => res.status(200).json(detail))
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //!Get incident by id
  updateIncident = (req: Request, res: Response) => {
    throw new Error("Method not implemented.");
  };

  //!Get incidents by user
  getIncidentsByUser = async (req: Request, res: Response) => {
    const user = req.body.user;
    if (!user) return res.status(400).json({ error: "No user provided" });
    //return console.log("USER", user);
    this.incidentService
      .getIncidentsByUser(user)
      .then((response) => res.status(200).json(response))
      .catch((error) => this.handleError(error, res));

    //const incidents = await;
  };

  //!Get incidents by location
  getIncidentsByLocation = (req: Request, res: Response) => {
    //TODO: Implementar
    throw new Error("Method not implemented.");
  };

  //!Delete incident
  deleteIncident = (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      return res.status(400).json({ error: `El id: ${id} no es valido` });

    this.incidentService
      .deleteIncident(id)
      .then((response) => {
        return res.status(200).json(response);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //! Update incident by status
  updateIncidentStatus = (req: Request, res: Response) => {
    const id = +req.params.id;
    const { status_id, coment } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "El id no es válido" });
    if (!status_id)
      return res.status(400).json({ error: "El estado es requerido" });

    const [error, updateStatusIncidentDto] = UpdateStatusIncidentDto.create({
      status_id,
      coment,
    });

    if (error) return res.status(400).json({ error });

    this.incidentService
      .updateIncidentStatus(
        id,
        +status_id,
        req.body.user,
        updateStatusIncidentDto?.coment
      )
      .then((response) => res.status(200).json(response))
      .catch((error) => this.handleError(error, res));
  };

  //! Incidentes by status
  getIncidentsByStatus = (req: Request, res: Response) => {
    const status_id = +req.params.status_id;
    if (isNaN(status_id))
      return res.status(400).json({ error: "El id no es válido" });

    // this.incidentService
    //   .getIncidentsByStatus(status_id)
    //   .then((response) => res.status(200).json(response))
    //   .catch((error) => this.handleError(error, res));
  };

  //Tiempo promedio de resolución de incidentes
  getAverageResolutionTime = async (req: Request, res: Response) => {
    this.incidentService
      .getAverageResolutionTime()
      .then((result) => res.status(200).json(result))
      .catch((error) => this.handleError(error, res));
  };
}
