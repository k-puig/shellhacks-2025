import { getAllUsersFrom, getUserInformation } from "../services/userService";

export async function fetchUserData(id: string) {
  return await getUserInformation(id);
}

export async function fetchAllUsers(instanceId: string) {
  return await getAllUsersFrom(instanceId);
}
