import { Request, Response } from "express";
import { IncidentModel } from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";

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
}
