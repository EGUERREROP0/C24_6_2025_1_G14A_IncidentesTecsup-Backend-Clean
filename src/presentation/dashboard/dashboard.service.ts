import { Request, Response } from "express";
import {
  IncidentModel,
  IncidentStatusModel,
  UserModel,
} from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";
import ExcelJS from "exceljs";

export class DashboardService {
  constructor() {}

  getTotalIncidents = async () => {
    try {
      const grouped = await IncidentModel.groupBy({
        by: ["status_id"],
        _count: { _all: true },
      });

      const total = await IncidentModel.count();

      const result: Record<string, number> = {
        totalIncidentes: total,
        incidentByStatusPending: 0,
        incidentByStatusIn_progress: 0,
        incidentByStatusResolved: 0,
        incidentByStatusClosed: 0,
        incidentByStatusReopened: 0,
      };

      grouped.forEach((item) => {
        switch (item.status_id) {
          case 1:
            result.incidentByStatusPending = item._count._all;
            break;
          case 2:
            result.incidentByStatusIn_progress = item._count._all;
            break;
          case 3:
            result.incidentByStatusResolved = item._count._all;
            break;
          case 4:
            result.incidentByStatusClosed = item._count._all;
            break;
          case 5:
            result.incidentByStatusReopened = item._count._all;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      throw CustomError.internalServer("Error al contar incidentes por estado");
    }
   
  };

  countIncidentsByPriority = async () => {
    try {
      const grouped = await IncidentModel.groupBy({
        by: ["priority"],
        _count: { _all: true },
      });

      const result: Record<string, number> = {
        incidentsByPriorityHigh: 0,
        incidentsByPriorityMedium: 0,
        incidentsByPriorityLow: 0,
      };

      grouped.forEach((item) => {
        switch (item.priority) {
          case "Alta":
            result.incidentsByPriorityHigh = item._count._all;
            break;
          case "Media":
            result.incidentsByPriorityMedium = item._count._all;
            break;
          case "Baja":
            result.incidentsByPriorityLow = item._count._all;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      throw CustomError.internalServer("Error al contar por prioridad");
    }
   
  };

 
  getAdminIncidentStats = async (userId: number) => {
    try {
      const grouped = await IncidentModel.groupBy({
        by: ["status_id"],
        where: { assigned_admin_id: userId },
        _count: { _all: true },
      });

      const total = await IncidentModel.count({
        where: { assigned_admin_id: userId },
      });

      const result: Record<string, number> = {
        totalIncidentes: total,
        incidentByStatusPending: 0,
        incidentByStatusIn_progress: 0,
        incidentByStatusResolved: 0,
        incidentByStatusClosed: 0,
        incidentByStatusReopened: 0,
      };

      grouped.forEach((item) => {
        switch (item.status_id) {
          case 1:
            result.incidentByStatusPending = item._count._all;
            break;
          case 2:
            result.incidentByStatusIn_progress = item._count._all;
            break;
          case 3:
            result.incidentByStatusResolved = item._count._all;
            break;
          case 4:
            result.incidentByStatusClosed = item._count._all;
            break;
          case 5:
            result.incidentByStatusReopened = item._count._all;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error("Error al obtener estadísticas del admin:", error);
      throw CustomError.internalServer(
        "No se pudieron obtener las estadísticas del admin"
      );
    }
  };

  getAdminIncidentsByPriority = async (userId: number) => {
    try {
      const grouped = await IncidentModel.groupBy({
        by: ["priority"],
        where: { assigned_admin_id: userId },
        _count: { _all: true },
      });

      const result: Record<string, number> = {
        incidentsByPriorityHigh: 0,
        incidentsByPriorityMedium: 0,
        incidentsByPriorityLow: 0,
      };

      grouped.forEach((item) => {
        switch (item.priority) {
          case "Alta":
            result.incidentsByPriorityHigh = item._count._all;
            break;
          case "Media":
            result.incidentsByPriorityMedium = item._count._all;
            break;
          case "Baja":
            result.incidentsByPriorityLow = item._count._all;
            break;
        }
      });

      return result;
    } catch (error) {
      console.error("Error al obtener incidentes por prioridad:", error);
      throw CustomError.internalServer(
        "No se pudo obtener la prioridad del admin"
      );
    }
  };

  //! Exportar usuarios a Excel
  exportUsersToExcel = async (req: Request, res: Response) => {
    try {
      const usuarios = await UserModel.findMany({
        include: {
          user_role: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Usuarios");

      // Definir columnas del Excel
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Nombre", key: "first_name", width: 20 },
        { header: "Apellido", key: "last_name", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Rol", key: "role", width: 20 },
        { header: "Activo", key: "is_active", width: 10 },
      ];

      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: "FF002D74" },
        size: 12,
      };

      // Agregar filas
      usuarios.forEach((user) => {
        worksheet.addRow({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.user_role?.name || "Sin rol",
          is_active: user.is_active ? "Sí" : "No",
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=usuarios.xlsx"
      );

      // Es MUY IMPORTANTE usar await aquí
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error al exportar usuarios a Excel:", error);
      if (!res.headersSent) {
        throw CustomError.internalServer("Error al generar el archivo Excel");
      }
    }
  };
}
