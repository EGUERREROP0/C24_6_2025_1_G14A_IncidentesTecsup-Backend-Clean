import { Request, Response } from "express";
import { UserService } from "./user.service";
import { CustomError } from "../../domain/error";
import { PaginationDto } from "../../domain";
import { CloudinaryService } from "../../lib/claudinary.service";
import { UserModel } from "../../data/postgres/prisma";

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  //*Mapear Error
  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${error}`);
    return res.status(500).json({ error: "Internal server Error" });
  };

  //* Get all users
  getAllUsers = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);

    if (error) return res.status(400).json({ error });
    if (search && typeof search !== "string")
      return res.status(400).json({ error: "El search debe ser un string" });

    this.userService
      .getAllUsers(paginationDto!, search as string)
      .then((users) => {
        return res.status(200).json(users);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //!*Get user by id
  getUserById = (req: Request, res: Response) => {
    const id = +req.params.id;
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `El id: ${id} ingresado no es un numero` });

    this.userService
      .getUserById(id)
      .then((user) => res.status(200).json(user))
      .catch((error) => this.handleError(error, res));
  };

  //* Profile user
  getProfileUser = (req: Request, res: Response) => {
    const user = req.body.user;

    if (!user) return res.status(400).json({ error: "No hay usuario" });

    this.userService
      .getProfileUser(user)
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  // Update user profile without image
  updateProfileUser = async (req: Request, res: Response) => {
    const user = req.body.user;
    const { first_name, last_name, email } = req.body;

    if (!user) return res.status(400).json({ error: "No hay usuario" });

    try {
      const updatedUser = await this.userService.updateProfileUser({
        id: user.id,
        first_name,
        last_name,
        email,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      return res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  };

  //TODO: Update profile user Only Photo
  updateProfileUserOnlyPhoto = async (req: Request, res: Response) => {
    const user = req.body.user;
    const { profile_picture } = req.body;
    console.log(user);

    const file = (req as any).files?.image;
    if (!file) return;

    const result = await this.cloudinaryService.uploadImage({
      fileBuffer: file.data,
      folder: "images_profile",
      fileName: `image_profile_${Date.now()}`,
      resourceType: "image",
    });

    if (!result?.secure_url) return res.status(400).json({ error: "Error" });

    try {
      const profileUpdated = await UserModel.update({
        where: { id: user.id },
        data: {
          profile_picture: result.secure_url || profile_picture,
        },
      });

      return res
        .status(200)
        .json({ profileUpdated, message: "Perfil actualizado correctamente" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: "Error al subir la imagen" });
    }
  };

  //!*Convert user to admin
  convertUserToAdmin = (req: Request, res: Response) => {
    const id = +req.params.id;
    console.log(id);
    if (isNaN(id))
      return res
        .status(400)
        .json({ error: `El id: ${id} ingresado no es un numero` });

    this.userService
      .convertUserToAdmin(id)
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //!*Delete user by id
  deleteUserById = (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: "El ID debe ser un numero" });

    this.userService
      .deleteUserById(id)
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch((error) => {
        this.handleError(error, res);
      });
  };

  //* Get user admins
  getAdmins = (req: Request, res: Response) => {
    const { page = 1, limit = 10, search = "" } = req.query;
    const [error, paginationDto] = PaginationDto.create(+page, +limit);

    if (error) return res.status(400).json({ error });
    if (search && typeof search !== "string")
      return res.status(400).json({ error: "El search debe ser un string" });

    this.userService
      .getAdmins(paginationDto!, search as string)
      .then((users) => res.status(200).json(users))
      .catch((error) => this.handleError(error, res));
  };
}
