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
      .getTotalIncidents(req, res)
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

  exportarUsuariosExcel = async (req: Request, res: Response) => {
    try {
      const usuarios = await UserModel.findMany({
        include: {
          user_role: true, // Asegúrate que este nombre coincida con tu relación en schema.prisma
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
      res.status(500).json({ message: "Error al generar el archivo Excel" });
    }
  };
}
