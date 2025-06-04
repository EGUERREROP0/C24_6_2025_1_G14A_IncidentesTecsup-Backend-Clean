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

      const allusers = users.map(({ password, ...restUser }) => restUser);

      console.log(allusers);

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
        users: allusers /*.map((user) => UserEntity.fromObject(user)),*/,
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
      if (error instanceof CustomError) throw error;
      throw CustomError.internalServer(`${error}`);
    }
  }

  // Get profile user
  async getProfileUser(user: UserEntity) {
    try {
      const findUser = await UserModel.findFirst({
        where: { id: user.id },
        include: { user_role: true },
      });

      if (!findUser) throw CustomError.notFound("Usuario no encontrado");

      // const {password, ...restUser} = findUser;

      return findUser; //UserEntity.fromObject(findUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw CustomError.internalServer(`${error}`);
    }
  }

  // Update profile user (sin imagen)
  async updateProfileUser(user: UserEntity) {
    try {
      const { id, first_name, last_name, email } = user;

      const updatedUser = await UserModel.update({
        where: { id },
        data: { first_name, last_name, email },
        include: { user_role: true },
      });

      return {
        user: UserEntity.fromObject(updatedUser),
        message: "Perfil actualizado correctamente",
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw CustomError.internalServer(`${error}`);
    }
  }

  //Convert user to admin
  async convertUserToAdmin(id: number) {
    try {
      const user = await UserModel.findUnique({ where: { id } });
      if (!user) throw CustomError.notFound("Usuario no encontrado");

      const updatedUser = await UserModel.update({
        where: { id },
        data: { role_id: 2 },
        include: {
          user_role: true,
        },
      });

      return UserEntity.fromObject(updatedUser);
    } catch (error) {
      console.error("Error converting user to admin:", error);
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
