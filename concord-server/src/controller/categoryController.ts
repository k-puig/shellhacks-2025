import{
    createCategory,
    getCategory,
    getCategoriesByInstance,
    updateCategory,
    deleteCategory,
    deleteAllCategoriesFromInstance,
} from "../services/channelService";
import{
    CreateCategoryInput,
    UpdateCategoryInput,
    DeleteCategoryInput,
    DeleteCategoriesByInstanceIdInput
} from "../validators/categoryValidator";

export async function createNewCategory(data: CreateCategoryInput) {
    return await createCategory(data);
}

export async function fetchCategoryData(id: string) {
    return await getCategory(id);
}

export async function fetchCategoriesByInstance(instanceId: string) {
    return await getCategoriesByInstance(instanceId);
}

export async function updateExistingCategory(data: UpdateCategoryInput) {
    return await updateCategory(data);
}

export async function deleteExistingCategory(data: DeleteCategoryInput) {
    return await deleteCategory(data);
}

export async function deleteAllCategoriesByInstance(data: DeleteCategoriesByInstanceIdInput) {
    return await deleteAllCategoriesFromInstance(data);
}

