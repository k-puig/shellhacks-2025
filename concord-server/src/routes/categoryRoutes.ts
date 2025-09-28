import {
    createNewCategory,
    fetchCategoryData,
    fetchCategoriesByInstance,
    updateExistingCategory,
    deleteExistingCategory,
    deleteAllCategoriesByInstance,
} from "../controller/categoryController";

import {
    createCategorySchema,
    CreateCategoryInput,
    UpdateCategoryInput,
    DeleteCategoriesByInstanceIdInput,
} from "../validators/categoryValidator";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
const categoryRoutes = new Hono()

categoryRoutes.post(
    "",
    describeRoute({
        description: "Create a new category",
        responses: {
            200: {
                description: "Success creating category",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            404: {
                description: "User Id not found",
                content: { 
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
        },
    }),
    zValidator("json", createCategorySchema),
    async (c) => {
        const data = c.req.valid("json") as CreateCategoryInput;
        const categoryData = await createNewCategory(data);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Failed to create category" }, 400);
        }
    }
)

categoryRoutes.get(
    "/:id",
    describeRoute({
        description: "Get category by id",
        responses: {
            200: {
                description: "Success getting category",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
            404: {
                description: "Category id not found",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
        },
    }),
    async (c) => {
        const id = c.req.param("id");
        const categoryData = await fetchCategoryData(id);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Category not found" }, 404);
        }
    }
);

categoryRoutes.get(
    "",
    describeRoute({
        description: "Get all categories by instance id",
        responses: {
            200: {
                description: "Success getting all categories in instance",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
        },
    }),
    zValidator("query", createCategorySchema),
    async (c) => {
        const instanceId = c.req.query("instanceId");
        if (!instanceId) {
            return c.json({ error: "No instance id provided" }, 400);
        }

        const categoryData = await fetchCategoriesByInstance(instanceId);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Error getting all categories from instance" }, 500);
        }
    }
);

categoryRoutes.put(
    "",
    describeRoute({
        description: "Update an existing category",
        responses: {
            200: {
                description: "Success updating category",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            404: {
                description: "Category id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
        },
    }),
    zValidator("json", createCategorySchema),
    async (c) => {
        const data = c.req.valid("json") as UpdateCategoryInput;
        const categoryData = await updateExistingCategory(data);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Failed to update category" }, 400);
        }
    }
);

categoryRoutes.delete(
    "",
    describeRoute({
        description: "Delete an existing category",
        responses: {
            200: {
                description: "Success deleting category",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            404: {
                description: "Category id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
        },
    }),
    zValidator("json", createCategorySchema),
    async (c) => {
        const data = c.req.valid("json") as UpdateCategoryInput;
        const categoryData = await deleteExistingCategory(data);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Failed to delete category" }, 400);
        }
    }
)

categoryRoutes.delete(
    "/:id/:userId",
    describeRoute({
        description: "Delete all categories by instance id",
        responses: {
            200: {
                description: "Success deleting all categories in instance",
                content: {
                    "application/json": { schema: resolver(createCategorySchema) },
                },
            },
            400: {
                description: "Bad Request - Invalid input data",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            401: {
                description: "Unauthorized - Admin access required",
                content: {
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
            404: {
                description: "Instance id or User Id not found",
                content: { 
                    "application/json": { schema: resolver(createCategorySchema)},
                },
            },
        },
    }),
    zValidator("json", createCategorySchema),
    async (c) => {
        const data = c.req.valid("json") as DeleteCategoriesByInstanceIdInput;
        const categoryData = await deleteAllCategoriesByInstance(data);
        if (categoryData) {
            return c.json(categoryData);
        } else {
            return c.json({ error: "Failed to delete categories" }, 400);
        }
    }   
)



export { categoryRoutes };