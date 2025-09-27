import {
  Message,
  MessagePing,
  PrismaClient,
  Role,
  UserAuth,
} from "@prisma/client";

const prisma = new PrismaClient();

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
    const instances = await prisma.instance.findMany();
    if (!instances) {
      throw new Error("could not get all instances");
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

    return userData;
  } catch (err) {
    console.log(err);
    return null;
  }
}
