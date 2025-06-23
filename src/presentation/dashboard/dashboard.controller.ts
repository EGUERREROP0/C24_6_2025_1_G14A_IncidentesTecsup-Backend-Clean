import { Request, Response } from "express";
import { IncidentModel, UserModel } from "../../data/postgres/prisma";
import { DashboardService } from "./dashboard.service";
import { CustomError } from "../../domain/error";
import ExcelJS from "exceljs";
import { priority_enum } from "@prisma/client";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  //*Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };
  getTotalIncidents = (req: Request, res: Response) => {
    this.dashboardService
      .getTotalIncidents()
      .then((result) => {
        if (result) {
          return res.status(200).json({
            status: "success",
            data: result,
          });
        }
        //   } else {
        //     return res.status(500).json({
        //       status: "error",
        //       message: "Error al obtener los incidentes",
        //     });
        //   }
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  countIncidentsByPriority = (req: Request, res: Response) => {
    this.dashboardService
      .countIncidentsByPriority()
      .then((result) => res.json({ priority: result }))
      .catch((error) => this.handleError(error, res));
  };

  exportUsersToExcel = async (req: Request, res: Response) => {
    this.dashboardService
      .exportUsersToExcel(req, res)
      .then((workbook) => {})
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //* ADMINS SECONDARIES DATA
  getAdminIncidentStats = (req: Request, res: Response) => {
    const id = req.body.user.id;

    console.log(id);
    this.dashboardService
      .getAdminIncidentStats(+id)
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  getAdminIncidentResumen = (req: Request, res: Response) => {
    const userId = req.body.user.id;

    this.dashboardService
      .getAdminIncidentStats(userId)
      .then((result) => {
        res.status(200).json({
          status: "success",
          data: result,
        });
      })
      .catch((error) => this.handleError(error, res));
  };

  getAdminIncidentPriority = (req: Request, res: Response) => {
    const userId = req.body.user.id;

    this.dashboardService
      .getAdminIncidentsByPriority(userId)
      .then((result) => {
        res.status(200).json({
          status: "success",
          priority: result,
        });
      })
      .catch((error) => this.handleError(error, res));
  };
}
