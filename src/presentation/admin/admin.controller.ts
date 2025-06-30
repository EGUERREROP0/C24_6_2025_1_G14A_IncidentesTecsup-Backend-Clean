import { Request, Response } from "express";
import {IncidentTypeAdminModel } from "../../data/postgres/prisma";
import { AdminService } from "./admin.service";
import { AsignResponsabilityAdminDto } from '../../domain/dtos/admin/asign-responsability-admin.dto';
import { CustomError } from "../../domain/error";
import { PaginationDto } from "../../domain";

export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //!Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  //Endpoint para asignar un admin a un incidente
  public AsignResponsabilityAdmin = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { incident_type_id } = req.body;
    if (isNaN(+id))
      return res.status(400).json({ error: "ID no es un numero" });

    const [error, asignResponsabilityAdminDto] =
      AsignResponsabilityAdminDto.compare({ incident_type_id, id });

    if (error) return res.status(400).json({ error });

    this.adminService
      .AsignResponsabilityAdmin(asignResponsabilityAdminDto!)
      .then((admin) => res.status(201).json(admin))
      .catch((error) => this.handleError(error, res));
  };

  // //Endpoint para obtener los incidentes por adminId
  // public getIncidentsByAdminId =    (req: Request, res: Response) => {
  //   const adminId = req.body.user.id;
  //   if(isNaN(adminId) || !adminId) res.status(400).json({error:"Admin ID no es un numero"});

  //   this.adminService.getIncidentsByAdminId(adminId)
  //     .then((incidents) => {
  //       res.status(200).json(incidents);
  //     })
  //     .catch((error)=> this.handleError(error, res));
  // }

  public getIncidentsByAdminId = async (req: Request, res: Response) => {
    const adminId = req.body.user.id;

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
      status_id: status_id ? +status_id : undefined,
      type_id: type_id ? +type_id : undefined,
    };

    try {
      const response = await this.adminService.getIncidentsByAdminId(
        adminId,
        paginationDto!,
        search as string,
        filters
      );
      res.status(200).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  };
}
