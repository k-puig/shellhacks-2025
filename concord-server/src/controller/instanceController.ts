import { createInstance, getAllInstances } from "../services/instanceService";
import { CreateInstanceRequest } from "../validators/instanceValidator";

export async function createInstanceReq(data:CreateInstanceRequest) {
    return await createInstance(data);
}

export async function getAllInstancesReq() {
    return await getAllInstances();
}