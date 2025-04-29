import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

//! Models
export const UserModel = prisma.app_user;
export const UserRolModel = prisma.app_user;
export const IncidentModel = prisma.incident;
export const IncidentHistoryModel = prisma.incident_history;
export const IncidentStatusModel = prisma.incident_status;
export const IncidentTypeModel = prisma.incident_type;
export const LocationModel = prisma.location;
export const NotificationModel = prisma.notification;
export const IncidentTypeAdminModel = prisma.incident_type_admin;
