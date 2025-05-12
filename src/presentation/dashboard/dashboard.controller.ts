import { Request, Response } from "express";
import { IncidentModel, UserModel } from "../../data/postgres/prisma";
import { DashboardService } from "./dashboard.service";
import { CustomError } from "../../domain/error";
import ExcelJS from "exceljs";

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
      .then((result) => res.json({ priotity: result }))
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
}
