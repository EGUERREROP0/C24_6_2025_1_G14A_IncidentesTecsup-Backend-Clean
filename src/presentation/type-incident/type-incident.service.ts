import { IncidentTypeModel } from "../../data/postgres/prisma";
import { TypeIncidentEntity } from "../../domain/entities/type-incident.entity";
import { CustomError } from "../../domain/error";

export class TypeIncidentService {
  constructor() {}

  async getAllTypeIncidents() {
    try {
      const types = await IncidentTypeModel.findMany();
      return types.map((type) => TypeIncidentEntity.fromObject(type));
    } catch (error) {
      console.error("Error al obtener los tipos de incidentes:", error);
      throw CustomError.internalServer(
        "Error al obtener los tipos de incidentes: "
      );
    }
  }

  deleteTypeIncident = async (id: number) => {
    try {
      const typeIncident = await IncidentTypeModel.delete({
        where: { id },
      });
      return typeIncident;
    } catch (error) {
      console.error("Error al eliminar el tipo de incidente:", error);
      throw CustomError.internalServer(
        "Error al eliminar el tipo de incidente: "
      );
    }
  };

  createTypeIncident = async (name: string) => {
    try {
      const typeIncident = await IncidentTypeModel.create({
        data: { name },
      });
      return {
        typeIncident,
        message: `Tipo de incidente ${typeIncident.name} creado`,
      };
    } catch (error) {
      console.error("Error al crear el tipo de incidente:", error);
      throw CustomError.internalServer("Error al crear el tipo de incidente: ");
    }
  };
}
