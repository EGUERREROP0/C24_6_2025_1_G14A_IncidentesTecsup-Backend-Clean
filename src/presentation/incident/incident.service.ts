import { notification } from "./../../../node_modules/.prisma/client/index.d";
import { Console } from "console";
import { envs, FormatTime, HelperSanitizar } from "../../config";
import {
  IncidentHistoryModel,
  IncidentModel,
  IncidentTypeAdminModel,
  LocationModel,
  NotificationModel,
  UserModel,
} from "../../data/postgres/prisma";
import { CreateincidentDto, PaginationDto, UserEntity } from "../../domain";
import { IncidentEntity } from "../../domain/entities/incident.entity";
import { CustomError } from "../../domain/error";
import { CloudinaryService } from "../../lib/claudinary.service";
import axios from "axios";
import { priority_enum, Prisma } from "@prisma/client";
import { NotificationService } from "../../lib/notifications";

export class IncidentService {
  private readonly notificationService = new NotificationService();

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async createIncident(createincidentDto: CreateincidentDto, user: UserEntity) {
    //Asignar responsable al incidente
    const responsibleAdmin = await IncidentTypeAdminModel.findFirst({
      where: { incident_type_id: +createincidentDto.type_id },
      //include: { admin: true },
    });

    if (!responsibleAdmin)
      throw CustomError.notFound("No hay admin responsable asignado");

    //console.log("DTO", createincidentDto.location);
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
          //title: createincidentDto.title,
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

      // Obtener info del usuario y admin
      const [reportUser, assignedAdmin] = await Promise.all([
        UserModel.findUnique({ where: { id: user.id } }),
        UserModel.findUnique({ where: { id: responsibleAdmin.admin_id } }),
      ]);

      // Notificar al usuario que reportó el incidente
      if (reportUser?.fcm_token) {
        await this.notificationService.sendPushNotification({
          token: reportUser.fcm_token,
          title: "Tu incidente fue registrado",
          body: `Descripción: ${incident.description}`,
          imageUrl: incident.image_url ?? undefined,
          data: {
            incidentId: String(incident.id),
          },
        });
      }

      // Notificar al admin responsable
      if (assignedAdmin?.fcm_token) {
        await this.notificationService.sendPushNotification({
          token: assignedAdmin.fcm_token,
          title: "Nuevo incidente asignado",
          body: `Prioridad: ${incident.priority}. Atiende cuanto antes.`,
          imageUrl: incident.image_url ?? undefined,
          data: {
            incidentId: String(incident.id),
          },
        });
      }

      return {
        incident: IncidentEntity.fromObject(incident),
        message: "Incidente reportado con exito",
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
  async getAllIncidents(
    paginationDto: PaginationDto,
    search: string,
    filters?: {
      priority?: "Alta" | "Media" | "Baja";
      status_id?: number;
      type_id?: number;
    }
  ) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where: Prisma.incidentWhereInput = {
      ...(search?.trim()
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
              // { priority: { contains: search, mode: "insensitive" as const } },
              {
                incident_type: {
                  name: {
                    contains: search,
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.status_id && { status_id: filters.status_id }),
      ...(filters?.type_id && { type_id: filters.type_id }),
    };

    console.log("WHERE", where);

    try {
      const [total, allIncidents] = await Promise.all([
        IncidentModel.count({ where }),

        IncidentModel.findMany({
          skip: skip,
          take: limit,
          where,

          include: {
            incident_status: true,
            incident_type: true,
            location: true,
            app_user_incident_assigned_admin_idToapp_user: true,
            app_user_incident_user_idToapp_user: true,
            incident_history: {
              include: {
                app_user: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            report_date: "desc",
          },
        }),
      ]);

      // if (!allIncidents) return { error: "No hay incidentes" };

      // const sanitizedAllIncidents = {
      //   ...allIncidents,
      //   app_user_incident_user_idToapp_user: HelperSanitizar.sanitizeUser(
      //     allIncidents.app_user_incident_user_idToapp_user
      //   ),
      //   app_user_incident_assigned_admin_idToapp_user:
      //     HelperSanitizar.sanitizeUser(
      //       allIncidents.app_user_incident_assigned_admin_idToapp_user
      //     ),
      // };

      const incidentsWithResponseTime = allIncidents.map((incident) => {
        let responseTime = null;
        if (incident.report_date && incident.close_date) {
          responseTime = FormatTime.formatResponseTime(
            incident.report_date,
            incident.close_date
          );
        }

        return {
          ...incident,
          response_time: responseTime,
        };
      });

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
        allIncidents: incidentsWithResponseTime,
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
    user: UserEntity,
    comentary?: string
  ) {
    try {
      const incident = await IncidentModel.findUnique({
        where: { id },
        include: { incident_status: true },
      });
      if (!incident)
        throw CustomError.notFound(`Incidente con id ${id} no encontrado`);

      // const previousStatusName = incident.status_id;

      const previousStatusName = incident.incident_status?.name;

      const shouldSetCloseDate = [3, 4].includes(newStatusId);

      const updatedIncident = await IncidentModel.update({
        where: { id },
        data: {
          status_id: newStatusId,
          close_date: shouldSetCloseDate ? new Date() : undefined,
        },
        include: {
          incident_status: true,
          incident_type: true,
          location: true,
        },
      });

      //Nombre de nuevo estado
      const newStatusName = updatedIncident.incident_status?.name;

      const generatedComment = comentary
        ? `${comentary} - Atendido por: ${user.first_name} ${user.last_name}`
        : `El estado del incidente fue cambiado de ${previousStatusName} a ${updatedIncident.incident_status?.name} por ${user.first_name}`;

      //Guardar el incidente en el historial
      await IncidentHistoryModel.create({
        data: {
          incident_id: id,
          previous_status: previousStatusName?.toString(),
          new_status: newStatusName?.toString(),
          comment: generatedComment,
          modified_by: user.id,
          change_date: new Date(),
        },
      });

      if (!incident.user_id) {
        throw CustomError.internalServer(
          "El incidente no tiene un usuario asignado"
        );
      }

      // Obtener info del usuario y admin
      const reportUser = await UserModel.findUnique({
        where: { id: incident.user_id },
      });

      // Notificar al usuario que reportó el incidente
      if (reportUser?.fcm_token) {
        await this.notificationService.sendPushNotification({
          token: reportUser.fcm_token,
          title: `Hola ${reportUser.first_name}, el estado de tu incidente ha cambiado`,
          body: `Descripción: ${incident.description}`,
          imageUrl: incident.image_url ?? undefined,
          data: {
            incidentId: String(incident.id),
          },
        });

        // REGISTRAR EN LA TABLA notification
        await NotificationModel.create({
          data: {
            sender_id: user.id, // quien hizo el cambio (admin)
            receiver_id: reportUser?.id, // quien reportó el incidente
            message: `El estado de tu incidente ha cambiado a '${updatedIncident.incident_status?.name}'.`,
            incident_id: incident.id,
          },
        });
      }

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
          incident_history: {
            include: {
              app_user: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      const sanitizedDetailIncident = {
        ...detailIncident,
        app_user_incident_user_idToapp_user: HelperSanitizar.sanitizeUser(
          detailIncident?.app_user_incident_user_idToapp_user
        ),
        app_user_incident_assigned_admin_idToapp_user:
          HelperSanitizar.sanitizeUser(
            detailIncident?.app_user_incident_assigned_admin_idToapp_user
          ),
      };

      return { detailIncident: sanitizedDetailIncident };
    } catch (error) {
      console.log(error);
      throw CustomError.internalServer(
        `Error al obtener el incidente con id ${id}`
      );
    }
  };
}
