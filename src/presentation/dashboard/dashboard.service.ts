import { Request, Response } from "express";
import { IncidentModel } from "../../data/postgres/prisma";

export class DashboardService {
  constructor() {}

  getTotalIncidents = async (req: Request, res: Response) => {
    
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
}
