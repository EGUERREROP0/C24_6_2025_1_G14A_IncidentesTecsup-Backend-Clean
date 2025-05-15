import { Request, Response } from "express";
import { TypeIncidentService } from "./type-incident.service";
import { CustomError } from "../../domain/error";
import { TypeIncidentDto } from "../../domain/dtos/type-incident/create-type-incdent.dto";

export class TypeIncidentController {
  constructor(private typeIncidentService: TypeIncidentService) {}

  //!Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  createTypeIncident = (req:Request, res:Response)=>{
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    const [error, typeIncidentDto] =  TypeIncidentDto.create(name);
    
    if(error) return res.status(400).json({ error });
    

    this.typeIncidentService
      .createTypeIncident(name)
      .then((typeIncident) => res.status(201).json(typeIncident))
      .catch((error) => this.handleError(error, res));
  }

  getAllTypeIncidents = async (req: Request, res: Response) => {
    this.typeIncidentService
      .getAllTypeIncidents()
      .then((typeIncidents) => res.status(200).json(typeIncidents))
      .catch((error) => this.handleError(error, res));
  };

  //@ Eliminar incidente
  deleteTypeIncident = (req: Request, res: Response) => {
    const id = +req.params.id;

    if (isNaN(id)) {
      return res.status(400).json({ error: "El ID no es un Numero" });
    }
    this.typeIncidentService
      .deleteTypeIncident(id)
      .then((deleted) =>
        res.status(200).json({
          message: `Tipo de incidente ${deleted.name} eliminado`,
          deleted,
        })
      )
      .catch((error) => this.handleError(error, res));
  };
}
