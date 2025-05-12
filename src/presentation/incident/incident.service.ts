import { Console } from "console";
import { envs, HelperSanitizar } from "../../config";
import {
  IncidentHistoryModel,
  IncidentModel,
  IncidentTypeAdminModel,
  LocationModel,
} from "../../data/postgres/prisma";
import { CreateincidentDto, PaginationDto, UserEntity } from "../../domain";
import { IncidentEntity } from "../../domain/entities/incident.entity";
import { CustomError } from "../../domain/error";
import { CloudinaryService } from "../../lib/claudinary.service";
import axios from "axios";

export class IncidentService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async createIncident(createincidentDto: CreateincidentDto, user: UserEntity) {
    //Asignar responsable al incidente
    const responsibleAdmin = await IncidentTypeAdminModel.findFirst({
      where: { incident_type_id: +createincidentDto.type_id },
      //include: { admin: true },
    });

    if (!responsibleAdmin)
      throw CustomError.notFound("No hay admin responsable asignado");

    console.log("DTO", createincidentDto.location);
    try {
      const location = await LocationModel.create({
        data: {
          latitude: createincidentDto.location.latitude,
          longitude: createincidentDto.location.longitude,
          altitude: createincidentDto.location.altitude,
        },
      });

      console.log("LOIONCAT", location);

      const incident = await IncidentModel.create({
        data: {
          title: createincidentDto.title,
          description: createincidentDto.description,
          image_url: createincidentDto.image_url,
          priority: createincidentDto.priority,
          type_id: +createincidentDto.type_id,
          user_id: user.id,
          status_id: 1,
          location_id: location.id,
          assigned_admin_id: responsibleAdmin.admin_id,
        },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
          //incident_type_admin: true,
        },
      });

      console.log("INCIDENT", incident);

      return {
        incident: IncidentEntity.fromObject(incident),
        message: "Incidente creado correctamente",
      };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer(`'Error creating incident' `);
    }
  }

  //? Claudinary upload images
  async handleCreateIncident(
    body: { [key: string]: any },
    user: UserEntity,
    file: any
  ) {
    if (!file) return { error: "No hay una imagen proporcionada" };

    if (typeof body.location === "string") {
      body.location = JSON.parse(body.location);
    }

    console.log("BODY", body);
    //Subir imagen a cloudinary
    const result = await this.cloudinaryService.uploadImage({
      fileBuffer: file.data,
      folder: "incidents",
      fileName: `incident_${Date.now()}`,
      resourceType: "image",
    });

    // console.log(result);
    if (!result?.secure_url) return { error: "Error subiendo imagen" };

    if (!result?.secure_url)
      throw CustomError.internalServer("Error subiendo imagen");

    /*
    // Verificar duplicado con FastAPI
    let duplicateCheck;
    try {
      duplicateCheck = await axios.post(envs.API_OPENIA, {
        description: body.description,
        image_url: result.secure_url,
        latitude: parseFloat(body.location.latitude),
        longitude: parseFloat(body.location.longitude),
      });
    } catch (error: any) {
      console.error("Error al conectar con FastAPI:", error.message);
      return {
        error: "No se pudo verificar duplicado con IA",
      };
    }

    // Si es duplicado, responder al frontend
    if (duplicateCheck.data.duplicado) {
      let score = duplicateCheck.data.score * 100;
      let whatTime = duplicateCheck.data.incidente_sugerido.hace_tiempo;

      return {
        duplicado: true,
        message: `Este incidente es muy similar a uno ya reportado ${whatTime}, probabilidad: ${Math.round(
          score
        )}%`,
        sugerido: duplicateCheck.data.incidente_sugerido,
        score: duplicateCheck.data.score,
      };
    }
    //Codigo nuevo 92 - 107*/

    // Validar DTO
    const [error, createIncidentDto] = CreateincidentDto.create({
      ...body,
      image_url: result.secure_url,
    });
    if (error) throw CustomError.badRequest(error);

    return this.createIncident(createIncidentDto!, user);
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
      // console.log(allIncidents);
      console.log("TOTAL", total);
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
  async deleteIncident(id: IncidentEntity["id"]) {
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

  // Update incident by status
  async updateIncidentStatus(
    id: number,
    newStatusId: number,
    user: UserEntity
  ) {
    try {
      const incident = await IncidentModel.findUnique({
        where: { id },
        include: { incident_status: true },
      });
      if (!incident)
        throw CustomError.notFound(`Incidente con id ${id} no encontrado`);

      const previousStatusName = incident.status_id;

      const updatedIncident = await IncidentModel.update({
        where: { id },
        data: { status_id: newStatusId },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
        },
      });

      //Guardar el incidente en el historial
      await IncidentHistoryModel.create({
        data: {
          incident_id: id,
          previous_status: previousStatusName?.toString(),
          new_status: newStatusId.toString(),
          comment: `El estado del incidente fue cambiado de 
          ${incident.incident_status?.name} a ${updatedIncident.incident_status?.name} por ${user.first_name}`,
          modified_by: user.id,
          change_date: new Date(),
        },
      });

      return {
        message: "Estado del incidente actualizado correctamente",
        updatedIncident: updatedIncident, //IncidentEntity.fromObject(updatedIncident),
      };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer(
        `Error actualizando estado del incidente`
      );
    }
  }

  //Get incident by id
  getIncidentById = async (id: number) => {
    if (!id) throw CustomError.badRequest("Id no proporcionado");
    try {
      const detailIncident = await IncidentModel.findUnique({
        where: { id },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
          app_user_incident_assigned_admin_idToapp_user: true,
          app_user_incident_user_idToapp_user: true,
        },
      });

      if (!detailIncident)
        throw CustomError.notFound(`Incidente con id ${id} no encontrado`);

      const sanitizedDetailIncident = {
        ...detailIncident,
        app_user_incident_user_idToapp_user: HelperSanitizar.sanitizeUser(
          detailIncident.app_user_incident_user_idToapp_user
        ),
        app_user_incident_assigned_admin_idToapp_user:
          HelperSanitizar.sanitizeUser(
            detailIncident.app_user_incident_assigned_admin_idToapp_user
          ),
      };

      console.log(sanitizedDetailIncident.location_id?.toFixed(27));

      return { detailIncident: sanitizedDetailIncident };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer(
        `Error al obtener el incidente con id ${id}`
      );
    }
  };
}
