import { getAllUsersFrom, getUserInformation, createUser } from "../services/userService";
import { CreateUserInput } from "../validators/userValidator";

export async function fetchUserData(id: string) {
  return await getUserInformation(id);
}

export async function fetchAllUsers(instanceId: string) {
  return await getAllUsersFrom(instanceId);
}

export async function createNewUser(data: CreateUserInput) {
  return await createUser(data);
}
