import { IncidentTypeAdminModel, IncidentTypeModel } from "../../data/postgres/prisma";
import { TypeIncidentEntity } from "../../domain/entities/type-incident.entity";
import { CustomError } from "../../domain/error";

export class TypeIncidentService {
  constructor() {}

  async getAllTypeIncidents() {
    try {
      const types = await IncidentTypeModel.findMany({
        where: { is_active: true },
      });
      return types.map((type) => TypeIncidentEntity.fromObject(type));
    } catch (error) {
      console.error("Error al obtener los tipos de incidentes:", error);
      throw CustomError.internalServer(
        "Error al obtener los tipos de incidentes: "
      );
    }
  }

  // deleteTypeIncident = async (id: number) => {
  //   try {
  //     const typeIncident = await IncidentTypeModel.update({
  //       where: { id },
  //       data: { is_active: false },
  //     });
  //     return typeIncident;
  //   } catch (error) {
  //     console.error("Error al eliminar el tipo de incidente:", error);
  //     throw CustomError.internalServer(
  //       "Error al eliminar el tipo de incidente: "
  //     );
  //   }
  // };

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

  updateTypeIncident = async (id: number, name: string) => {
    try {
      const typeIncident = await IncidentTypeModel.update({
        where: { id },
        data: { name },
      });
      return {
        typeIncident: TypeIncidentEntity.fromObject(typeIncident),
        message: `Tipo de incidente ${typeIncident.name} actualizado`,
      };
    } catch (error) {
      console.error("Error al actualizar el tipo de incidente:", error);
      throw CustomError.internalServer(
        "Error al actualizar el tipo de incidente: "
      );
    }
  };

  deleteTypeIncident = async (id: number) => {
    try {
      // Verificar si el tipo de incidente está asignado a algún admin
      const assignedAdmins = await IncidentTypeAdminModel.findFirst({
        where: {
          incident_type_id: id,
        },
      });

      if (assignedAdmins) {
        throw CustomError.badRequest(
          "No se puede eliminar el tipo de incidente porque está asignado a algun administrador."
        );
      }
      const typeIncident = await IncidentTypeModel.update({
        where: { id },
        data: { is_active: false },
      });

      return typeIncident;
    } catch (error) {
      console.error("Error al eliminar el tipo de incidente:", error);
      if (error instanceof CustomError) {
        throw error;
      }

      throw CustomError.internalServer(
        "Error al eliminar el tipo de incidente"
      );
    }
  };
}
