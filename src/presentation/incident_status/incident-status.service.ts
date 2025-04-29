import { IncidentStatusModel } from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";



export class IncidentStatusService {

    constructor(){}

    getAllIncidentStatuses = async () => {
        try {
            const incidentStatus = await IncidentStatusModel.findMany();
            if (!incidentStatus) throw CustomError.notFound
            return incidentStatus;
        } catch (error) {
            console.error("Error fetching incident status:", error);
            throw CustomError.internalServer("Error en el servidor");
        }
    };

    getIncidentStatusById = async (id: number) => {
        try {
            const incidentStatus = await IncidentStatusModel.findUnique({
                where: { id },
            });
            if (!incidentStatus) throw CustomError.notFound("Estado de incidente no encontrado");
            return incidentStatus;
        } catch (error) {
            console.error("Error fetching incident status:", error);
            throw CustomError.internalServer("Error en el servidor");
        }
    };

    
}