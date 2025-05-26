import { NotificationModel } from "../../data/postgres/prisma";
import { CustomError } from "../../domain/error";

export class NotificationService {
  constructor() {}

  async getNotificationsByUser(userId: number) {
    if (!userId) throw CustomError.badRequest("User ID is required");

    try {
      const notificationsByUser = await NotificationModel.findMany({
        where: { receiver_id: userId },

        include: {
          app_user_notification_sender_idToapp_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          incident: {
            select: {
              id: true,
              description: true,
              image_url: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      });

      return notificationsByUser;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw CustomError.internalServer("Failed to fetch notifications");
    }

    return;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    console.log(`Notification ${notificationId} marked as read`);
  }
}
