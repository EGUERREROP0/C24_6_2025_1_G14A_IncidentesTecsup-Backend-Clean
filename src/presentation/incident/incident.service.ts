import { IncidentModel, LocationModel } from "../../data/postgres/prisma";
import { CreateincidentDto, PaginationDto, UserEntity } from "../../domain";
import { CustomError } from "../../domain/error";

export class IncidentService {
  async createIncident(createincidentDto: CreateincidentDto, user: UserEntity) {
    console.log(createincidentDto.image_url);
    try {
      // const location = await LocationModel.create({
      //   data: {
      //     latitude: createincidentDto.location.latitude,
      //     longitude: createincidentDto.location.longitude,
      //     altitude: createincidentDto.location.altitude,
      //   },
      // });
      const incident = await IncidentModel.create({
        data: {
          title: createincidentDto.title,
          description: createincidentDto.description,
          image_url: createincidentDto.image_url,
          priority: createincidentDto.priority,
          type_id: +createincidentDto.type_id,
          user_id: user.id,
          status_id: 1,
          location_id: 1, //location.id,
        },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
        },
      });

      return {
        incident,
      };
    } catch (error) {
      throw CustomError.internalServer(`'Error creating incident': ${error}`);
    }
  }

  //Get all incidents
  async getAllIncidents(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [total, allIncidents] = await Promise.all([
        IncidentModel.count(),
        IncidentModel.findMany({
          skip: skip,
          take: limit,
          include: {
            incident_status: true,
            incident_type: true,
            location: true,
          },
          orderBy: {
            report_date: "desc",
          },
        }),
      ]);
      /*const allIncidents = await IncidentModel.findMany({
        skip: skip,
        take: limit,
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
        },
        orderBy: {
          report_date: "desc",
        },
      });*/

      return {
        page: page,
        limit: limit,
        total: total,
        nextTick:
          page >= Math.ceil(total / limit)
            ? null
            : `/api/v1/incident?page=${page + 1}&limit=${limit}`,
        prevTick:
          page > 1 ? `api/v1/incident?page=${page - 1}&limit=${limit}` : null,
        allIncidents,
      };
    } catch (error) {
      throw CustomError.internalServer(`'Error getting incidents': ${error}`);
    }
  }

  //Get incidents by user
  async getIncidentsByUser(user: UserEntity) {
    try {
      const incidents = await IncidentModel.findMany({
        where: {
          user_id: user.id,
        },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
        },
        orderBy: {
          report_date: "desc",
        },
      });
      if (!incidents) throw CustomError.notFound("No incidents found");
      if (incidents.length === 0)
        throw CustomError.notFound("No incidents found");
      if (incidents.length > 0) {
        return incidents;
      }

      return incidents;
    } catch (error) {
      console.log(error);
    }
  }

  //Delete incident
  async deleteIncident(id: number) {
    try {
      const idIsMatch = await IncidentModel.findUnique({
        where: { id: id },
      });
      if (!idIsMatch)
        throw CustomError.notFound(`Incidente con id: ${id} no encontrado`);

      const deleted = await IncidentModel.delete({
        where: { id: id },
        include: { incident_status: true, incident_type: true, location: true },
      });

      return {
        message: "Incidente eliminado correctamente",
        deleted,
      };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer(` ${error}`);
    }
  }
}
