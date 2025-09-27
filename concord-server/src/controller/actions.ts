import { getUserInformation } from "../services/actions";


export async function fetchUserData(id: string) {
    return await getUserInformation(id);
}