import { Request, Response } from "express";
import { LocationModel } from "../../data/postgres/prisma";


export class LocationController {

    constructor() {}
    
    public async getAllLocations(req: Request, res: Response) {
        
        try {
            const locations = await LocationModel.findMany({});
            return res.status(200).json(locations);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
       
    }
}