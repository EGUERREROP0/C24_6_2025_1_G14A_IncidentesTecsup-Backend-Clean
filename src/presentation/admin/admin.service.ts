import {
  IncidentModel,
  IncidentTypeAdminModel,
} from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";
import { AsignResponsabilityAdminDto } from "../../domain/dtos/admin/asign-responsability-admin.dto";
import { FormatTime } from "../../config";
import { PaginationDto } from "../../domain";
import { Prisma } from "@prisma/client";

export class AdminService {
  public AsignResponsabilityAdmin = async (
    asignResponsabilityAdminDto: AsignResponsabilityAdminDto
  ) => {
    // id --> Es el IDADMIN
    const { id, incident_type_id } = asignResponsabilityAdminDto;

    const AsignedAdmin = await IncidentTypeAdminModel.create({
      data: {
        admin_id: +id,
        incident_type_id: +incident_type_id,
      },
    });

    return {
      AsignedAdmin,
    };
  };

  // public getIncidentsByAdminId = async (adminId: number) => {
  //   if (!adminId) throw CustomError.badRequest("Admin ID is required");

  //   try {
  //     const incidents = await IncidentModel.findMany({
  //       where: { assigned_admin_id: adminId },
  //       include: {
  //         location: true,
  //         incident_type: true,
  //         incident_status: true,
  //         app_user_incident_assigned_admin_idToapp_user: true,
  //         app_user_incident_user_idToapp_user: true,
  //         incident_history: {
  //           include: {
  //             app_user: {
  //               select: {
  //                 first_name: true,
  //                 last_name: true,
  //                 email: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     return { incidents };
  //   } catch (error) {
  //     console.error("Error fetching incidents by admin ID:", error);
  //     throw CustomError.internalServer("Error fetching incidents");
  //   }
  // };

  public async getIncidentsByAdminId(
    adminId: number,
    paginationDto: PaginationDto,
    search: string,
    filters?: {
      priority?: "Alta" | "Media" | "Baja";
      status_id?: number;
      type_id?: number;
    }
  ) {
    if (!adminId) throw CustomError.badRequest("Admin ID is required");

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where: Prisma.incidentWhereInput = {
      assigned_admin_id: adminId,
      ...(search?.trim()
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              {
                incident_type: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.status_id && { status_id: filters.status_id }),
      ...(filters?.type_id && { type_id: filters.type_id }),
    };

    try {
      const [total, incidents] = await Promise.all([
        IncidentModel.count({ where }),
        IncidentModel.findMany({
          skip,
          take: limit,
          where,
          include: {
            location: true,
            incident_type: true,
            incident_status: true,
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
          orderBy: { report_date: "desc" },
        }),
      ]);

      const incidentsWithResponseTime = incidents.map((incident) => {
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
        page,
        limit,
        total,
        nextTick:
          page >= Math.ceil(total / limit)
            ? null
            : `/api/v1/incident/admin?page=${page + 1}&limit=${limit}`,
        prevTick:
          page > 1
            ? `/api/v1/incident/admin?page=${page - 1}&limit=${limit}`
            : null,
        incidents: incidentsWithResponseTime,
      };
    } catch (error) {
      console.error("Error fetching incidents by admin ID:", error);
      throw CustomError.internalServer("Error fetching incidents");
    }
  }
}
