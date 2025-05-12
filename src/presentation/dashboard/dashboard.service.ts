import { Request, Response } from "express";
import { IncidentModel, UserModel } from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";
import ExcelJS from "exceljs";

export class DashboardService {
  constructor() {}

  getTotalIncidents = async () => {
    try {
      const [
        totalIncidentes,
        incidentByStatusPending,
        incidentByStatusIn_progress,
        incidentByStatusResolved,
        incidentByStatusClosed,
        incidentByStatusReopened,
      ] = await Promise.all([
        IncidentModel.count(),
        IncidentModel.count({
          where: { status_id: 1 },
        }),
        IncidentModel.count({
          where: { status_id: 2 },
        }),
        IncidentModel.count({
          where: { status_id: 3 },
        }),
        IncidentModel.count({
          where: { status_id: 4 },
        }),
        IncidentModel.count({
          where: { status_id: 5 },
        }),
      ]);

      return {
        totalIncidentes,
        incidentByStatusPending,
        incidentByStatusIn_progress,
        incidentByStatusResolved,
        incidentByStatusClosed,
        incidentByStatusReopened,
      };
    } catch (error) {
      console.error(error);
    }
  };

  countIncidentsByPriority = async () => {
    try {
      const incidentsByPriorityLow = await IncidentModel.count({
        where: { priority: "Alta" },
      });
      const incidentsByPriorityMedium = await IncidentModel.count({
        where: { priority: "Media" },
      });
      const incidentsByPriorityHigh = await IncidentModel.count({
        where: { priority: "Baja" },
      });

      return {
        incidentsByPriorityLow,
        incidentsByPriorityMedium,
        incidentsByPriorityHigh,
      };
    } catch (error) {
      console.error(error);
      throw CustomError.internalServer(
        "Error al contar los incidentes por prioridad"
      );
    }
  };

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
