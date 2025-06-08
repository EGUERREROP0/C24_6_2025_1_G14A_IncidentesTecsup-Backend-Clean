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

  // dashboardResumen = async (req: Request, res: Response) => {
  //   const adminId = req.query.adminId ? Number(req.query.adminId) : null;

  //   try {
  //     // Mapeo de nombres de estado a sus IDs según los datos insertados en tu BD
  //     const statusMap: Record<string, number> = {
  //       pendiente: 1,
  //       en_progreso: 2,
  //       resuelto: 3,
  //       cerrado: 4,
  //       re_abierto: 5,
  //     };

  //     const baseFilter = adminId ? { assigned_admin_id: adminId } : {};

  //     const [total, pendientes, enProgreso, resueltos, cerrados, reabiertos] =
  //       await Promise.all([
  //         IncidentModel.count({ where: baseFilter }),
  //         IncidentModel.count({
  //           where: { ...baseFilter, status_id: statusMap.pendiente },
  //         }),
  //         IncidentModel.count({
  //           where: { ...baseFilter, status_id: statusMap.en_progreso },
  //         }),
  //         IncidentModel.count({
  //           where: { ...baseFilter, status_id: statusMap.resuelto },
  //         }),
  //         IncidentModel.count({
  //           where: { ...baseFilter, status_id: statusMap.cerrado },
  //         }),
  //         IncidentModel.count({
  //           where: { ...baseFilter, status_id: statusMap.re_abierto },
  //         }),
  //       ]);

  //     return res.json({
  //       data: {
  //         total,
  //         pendientes,
  //         enProgreso,
  //         resueltos,
  //         cerrados,
  //         reabiertos,
  //       },
  //     });
  //   } catch (err) {
  //     console.error("Error en dashboardResumen", err);
  //     return res.status(500).json({ error: "Error interno en dashboard" });
  //   }
  // };

  // incidentsByPriority = async (req: Request, res: Response) => {
  //   const { adminId } = req.query;

  //   const whereFilter = adminId ? { assigned_admin_id: Number(adminId) } : {};

  //   const data = await IncidentModel.groupBy({
  //     by: ["priority"],
  //     _count: { priority: true },
  //     where: whereFilter,
  //   });

  //   const formatted = data.map((item) => ({
  //     prioridad: item.priority,
  //     cantidad: item._count.priority,
  //   }));

  //   return res.json(formatted);
  // };

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
