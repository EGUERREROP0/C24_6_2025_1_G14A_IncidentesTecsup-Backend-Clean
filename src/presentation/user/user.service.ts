import { UserModel } from "../../data/postgres/prisma";
import { PaginationDto, UserEntity } from "../../domain";
import { CustomError } from "../../domain/error/custom.error";
import { nextTick } from "process";

export class UserService {
  constructor() {}

  async getAllUsers(paginationDto: PaginationDto, search: string) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const where = search?.trim()
      ? {
          OR: [
            { first_name: { contains: search, mode: "insensitive" as const } },
            { last_name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            {
              user_role: {
                name: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],

          //  OR:[
          //    first_name: {
          //     contains: search,
          //     mode: "insensitive" as const, // indicar que el modo es "insensitive" es valido no solo string sino cualquiera
          //   },
          //   user_role:{
          //     role_name: {
          //       contains: search,
          //       mode: "insensitive" as const,
          //     },
          //   }
          //  ]
        }
      : {};
    try {
      const [total, users] = await Promise.all([
        UserModel.count({ where }),
        UserModel.findMany({
          skip,
          take: limit,
          where,
          include: {
            user_role: true,
          },
        }),
      ]);

      return {
        skip,
        page,
        limit,
        total,
        nextTick:
          page >= Math.ceil(total / limit)
            ? null
            : `/api/user?page=${page + 1}&limit=${limit}&search=${search}`,
        prevTick:
          page <= 1
            ? null
            : `/api/user?page=${page - 1}&limit=${limit}&search=${search}`,
        users: users.map((user) => UserEntity.fromObject(user)),
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw CustomError.internalServer("Error en el servidor");
    }
  }

  //Get user by id
  async getUserById(id: number) {
    try {
      const user = await UserModel.findUnique({ where: { id } });
      if (!user) throw CustomError.notFound("Usuario no encontrado");

      return UserEntity.fromObject(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw CustomError.internalServer(`${error}`);
    }
  }

  //Delete user by id
  async deleteUserById(id: number) {
    try {
      const user = await UserModel.findUnique({ where: { id } });
      if (!user) throw CustomError.notFound("Usuario no encontrado");

      await UserModel.delete({ where: { id } });
      return user;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw CustomError.internalServer(`${error}`);
    }
  }
}
