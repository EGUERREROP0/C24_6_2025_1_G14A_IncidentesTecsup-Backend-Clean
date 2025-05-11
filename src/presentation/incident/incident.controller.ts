import { Request, Response } from "express";
import { CustomError } from "../../domain/error";
import { CreateincidentDto, PaginationDto } from "../../domain";
import { IncidentService } from "./incident.service";
import { CloudinaryService } from "../../lib/claudinary.service";

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
    // console.log("BODY:", req.body);
    // console.log("FILES:", file);

    /*if (!file) return res.status(400).json({ error: "No image provided" });

    //Subir imagen a cloudinary
    const result = await this.cloudinaryService.uploadImage({
      fileBuffer: file.data,
      folder: "incidents",
      fileName: `incident_${Date.now()}`,
      resourceType: "image",
    });

    console.log(result);
    if (!result?.secure_url)
      return res.status(500).json({ error: "Error subiendo imagen" });

    //?validate dto
    const [error, createIncidentDto] = CreateincidentDto.create({
      ...req.body,
      image_url: result.secure_url,
    });
    if (error) return res.status(400).json({ error });*/

    this.incidentService
      .handleCreateIncident(req.body, user, file)
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
    const { page = 1, limit = 10 } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);
    if (error) return res.status(400).json({ error });

    this.incidentService
      .getAllIncidents(paginationDto!)
      .then((response) => res.status(200).json(response))
      .catch((error) => this.handleError(error, res));
  };

  getIncidentById = (req: Request, res: Response) => {
    res.json("Incident ---qweqwe");
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
    const { status_id } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "El id no es válido" });
    if (!status_id)
      return res.status(400).json({ error: "El estado es requerido" });

    this.incidentService
      .updateIncidentStatus(id, +status_id, req.body.user)
      .then((response) => res.status(200).json(response))
      .catch((error) => this.handleError(error, res));
  };
}
