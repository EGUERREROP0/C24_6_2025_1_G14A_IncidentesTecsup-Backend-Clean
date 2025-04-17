import { IncidentTypeModel } from "../../data/postgres/prisma";
import { TypeIncidentEntity } from "../../domain/entities/type-incident.entity";

export class TypeIncidentService {
  constructor() {}

  async getAllTypeIncidents() {
    try {
      const types = await IncidentTypeModel.findMany();
      return types.map((type) => TypeIncidentEntity.fromObject(type));
    } catch (error) {
      console.error("Error al obtener los tipos de incidentes:", error);
      throw new Error("Error al obtener los tipos de incidentes: ");
    }
  }
}
