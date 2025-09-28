import { PrismaClient } from "@prisma/client";
import { CreateInstanceRequest } from "../validators/instanceValidator";
import { getUserCredentials, getUserInformation } from "./userService";

const prisma = new PrismaClient();

export async function createInstance(data: CreateInstanceRequest) {
  try {
    const creds = await getUserCredentials(data.requestingUserId);
    const user = await getUserInformation(data.requestingUserId);
    if (
      !creds ||
      creds.token != data.requestingUserToken ||
      !user ||
      !user.admin
    ) {
      return null;
    }

    const newInstance = await prisma.instance.create({
      data: {
        name: data.name,
        icon: data.icon,
      },
    });

    return {
      success: true,
      data: newInstance,
    };
  } catch (error) {
    console.error("Error creating instance:", error);
    return {
      success: false,
      error: "Failed to create instance",
    };
  }
}

export async function getAllInstances() {
  try {
    const instances = await prisma.instance.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: instances,
    };
  } catch (error) {
    console.error("Error fetching instances:", error);
    return {
      success: false,
      error: "Failed to fetch instances",
    };
  }
}

export async function getInstanceByChannelId(id: string) {
  try {
    const instance = await prisma.instance.findFirst({
      where: {
        Category: {
          some: {
            Channel: {
              some: {
                id: id
              }
            }
          }
        }
      },
    });

    if (!instance) {
      return null;
    }

    return instance;
  } catch (error) {
    console.error("Error fetching instance by channel ID:", error);
    return null;
  }
}

export async function getInstancesByUserId(id: string) {
  try {
    const user = await getUserInformation(id);
    if (user && user.admin) {
      const adminInstances = await getAllInstances();
      if (adminInstances && adminInstances.success)  {
        return adminInstances.data;
      }
    }

    const instance = await prisma.instance.findMany({
      where: {
        Role: {
          some: {
            User: {
              id: id
            }
          }
        }
      }
    });

    if (!instance) {
      return null;
    }

    return instance;
  } catch (error) {
    console.error("Error fetching instance by channel ID:", error);
    return null;
  }
}

