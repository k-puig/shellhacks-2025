import {
  Message,
  MessagePing,
  PrismaClient,
  Role,
  UserAuth,
} from "@prisma/client";
import { CreateUserInput } from '../validators/userValidator';
import shaHash from "../helper/hashing";

const prisma = new PrismaClient();

export async function createUser(data: CreateUserInput): Promise<{
  username: string,
  nickname: string | null,
  bio: string | null,
  picture: string | null,
  banner: string | null,
  status: string,
  admin: boolean
} | null> {
  const requestingUser = await getUserInformation(data.requestingUserId);
  const requestingUserCredentials = await getUserCredentials(data.requestingUserId)
  if (!requestingUser
    || !requestingUserCredentials 
    || !requestingUser.admin
    || requestingUserCredentials.token == null 
    || data.requestingUserToken != requestingUserCredentials.token) {
    return null;
  }

  if (await prisma.user.count({ where: { username: data.username }}) >= 1) {
    return null;
  }

  const userData = await prisma.user.create({
    data: {
      username: data.username,
      nickname: data.nickname,
      bio: data.bio,
      picture: data.picture,
      banner: data.banner,
      status: data.status,
      admin: data.admin,
    },
  });

  if (!(await prisma.userAuth.create({
    data: {
      userId: userData.id,
      password: shaHash(data.passwordhash, userData.id),
      token: null,
    }
  }))) {
    return null;
  }

  return userData;
}

export async function getUserCredentials(userId: string): Promise<{
    userId: string,
    password: string,
    token: string | null
  } | null> {
    try {
      if (!userId) {
        throw new Error("missing userId");
      }

      const userAuth = await prisma.userAuth.findUnique({
        where: {
          userId: userId,
        },
      });

      if (!userAuth) {
        throw new Error("could not find user credentials");
      }

      return {
        userId: userAuth.userId,
        password: userAuth.password,
        token: userAuth.token,
      };
    } catch (err) {
      const errMessage = err as Error;

      if (errMessage.message === "missing userId") {
        console.log("services::actions::getUserCredentials - missing userId");
        return null;
      }

      if (errMessage.message === "could not find user credentials") {
        console.log(
          "services::actions::getUserCredentials - unable to find user credentials",
        );
        return null;
      }

      console.log(
        "services::actions::getUserCredentials - unknown error",
        errMessage,
      );
      return null;
    }
  }

export async function getUserInformation(userId: string): Promise<{
  id: string;
  userName: string;
  nickName: string | null;
  bio: string | null;
  picture: string | null;
  banner: string | null;
  admin: boolean;
  status: "online" | "offline" | "dnd" | "idle" | "invis";
  role: Role[];
} | null> {
  try {
    if (!userId) {
      throw new Error("missing userId");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("could not find user");
    }

    const userRoles = await prisma.role.findMany({
      where: {
        userId: userId,
      },
    });

    return {
      id: userId,
      userName: user.username,
      nickName: user.nickname,
      bio: user.bio,
      picture: user.picture,
      banner: user.banner,
      admin: user.admin,
      status: (["online", "offline", "dnd", "idle", "invis"] as const).includes(
        user.status as any,
      )
        ? (user.status as "online" | "offline" | "dnd" | "idle" | "invis")
        : "offline",
      role: userRoles,
    };
  } catch (err) {
    const errMessage = err as Error;

    if (errMessage.message === "missing userId") {
      console.log("services::actions::getUserInformation - missing userId");
      return null;
    }

    if (errMessage.message === "could not find user") {
      console.log(
        "services::actions::getUserInformation - unable to find user",
      );
      return null;
    }

    console.log(
      "services::actions::getUserInformation - unknown error",
      errMessage,
    );
    return null;
  }
}

export async function getAllUsersFrom(instanceId: string): Promise<
  | {
      id: string;
      userName: string;
      nickName: string | null;
      bio: string | null;
      picture: string | null;
      banner: string | null;
      admin: boolean;
      status: "online" | "offline" | "dnd" | "idle" | "invis";
      role: {
        userId: string;
        instanceId: string;
      }[];
    }[]
  | null
> {
  try {
    const instances = await prisma.instance.count({
      where: {
        id: instanceId
      }
    })
    if (instances < 1) {
      throw new Error("could not find given instance id");
    }

    const users = await prisma.user.findMany({
      where: {
        Role: {
          some: {
            instanceId: instanceId,
          },
        },
      },
    });
    if (!users) {
      throw new Error("could not get all users in instance");
    }

    const admins = await prisma.user.findMany({
      where: {
        admin: true
      }
    });
    if (!admins) {
      throw new Error("could not get all admins");
    }
    const adminData = await Promise.all(
      admins.map(async (u) => {
        const adminRoles = await prisma.role.findMany({
          where: {
            userId: u.id,
          },
        });

        if (!adminRoles) {
          throw new Error("could not get admin roles for admin " + u.id);
        }

        return {
          id: u.id,
          userName: u.username,
          nickName: u.nickname,
          bio: u.bio,
          picture: u.picture,
          banner: u.banner,
          admin: u.admin,
          status: (
            ["online", "offline", "dnd", "idle", "invis"] as const
          ).includes(u.status as any)
            ? (u.status as "online" | "offline" | "dnd" | "idle" | "invis")
            : "offline",
          role: adminRoles.map(r => ({
            userId: r.userId,
            instanceId: r.instanceId,
          })),
        }
      })
    )

    const userData = await Promise.all(
      users.map(async (u) => {
        const userRoles = await prisma.role.findMany({
          where: {
            userId: u.id,
          },
        });
        if (!userRoles) {
          throw new Error("could not get user roles for user " + u.id);
        }

        return {
          id: u.id,
          userName: u.username,
          nickName: u.nickname,
          bio: u.bio,
          picture: u.picture,
          banner: u.banner,
          admin: u.admin,
          status: (
            ["online", "offline", "dnd", "idle", "invis"] as const
          ).includes(u.status as any)
            ? (u.status as "online" | "offline" | "dnd" | "idle" | "invis")
            : "offline",
          role: userRoles,
        };
      }),
    );

    return userData.concat(adminData);
  } catch (err) {
    console.log(err);
    return null;
  }
}
