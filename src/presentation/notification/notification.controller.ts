import { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import { CustomError } from "../../domain/error";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  //*Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  getNotificationsByUser = (req: Request, res: Response) => {
    const user = req.body.user;

    this.notificationService
      .getNotificationsByUser(user.id)
      .then((notifications) => {
        return res.status(200).json(notifications);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };
}
