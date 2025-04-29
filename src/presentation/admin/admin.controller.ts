import { Request, Response } from "express";
import { IncidentModel, IncidentTypeAdminModel } from "../../data/postgres/prisma";

export class AdminController {
  public AsignResponsabilityAdmin = async (req: Request, res: Response) => {
    const id = +req.params.id;
    const incidentTypeIdNumber = +req.body.incident_type_id;
    //const s = +incident_type_id;
    const admin = await IncidentTypeAdminModel.create({
      data: {
        admin_id: id,
        incident_type_id: incidentTypeIdNumber,
      },
    });

    res.status(201).json(admin);
  };

  public getIncidentsByAdminId =   async (req: Request, res: Response) => {

    //   const admins = await IncidentTypeAdminModel.findMany({
    //     include: { app_user: true },
    //   });
    //   res.status(200).json(admins);
    console.log(req.body.user.id);

    const adminId = req.body.user.id; // extraído del JWT

     const incidents = await IncidentModel.findMany({
       where: { assigned_admin_id: adminId },
       include: { location: true, incident_type: true },
     });

     res.status(200).json(incidents);
  }
}




// const admin = async (req: Request, res: Response) => {
//       const id = +req.params.id;
//       const { incident_type_id } = req.body;
//       const incidentTypeIdNumber = +incident_type_id;
//       const admin = await IncidentTypeAdminModel.create({
//         data: {
//           admin_id: id,
//           incident_type_id: incidentTypeIdNumber,
//         },
//       });

//       res.status(201).json(admin);
//     };


// async (req: Request, res: Response) => {
//   //   const admins = await IncidentTypeAdminModel.findMany({
//   //     include: { app_user: true },
//   //   });
//   //   res.status(200).json(admins);
//   console.log(req.body.user.id);

//   const adminId = req.body.user.id; // extraído del JWT

 
// };