import { admin } from "../config/adapters/firebase";

interface NotificationPayload {
  token: string;
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
}

export class NotificationService {

  async sendPushNotification(payload: NotificationPayload): Promise<void> {
    const { token, title, body, imageUrl, data } = payload;

    try {
      await admin.messaging().send({
        token,
        notification: {
          title,
          body,
          imageUrl,
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          ...data,
        },
      });

      console.log("Notificación enviada con éxito al token:", token);
    } catch (error) {
      console.error(" Error enviando notificación FCM:", error);
    }
  }
}
