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
  getCategorySchema,
  getCategoriesByInstanceIdSchema,
  updateCategorySchema,
  deleteCategorySchema,
  deleteCategoriesByInstanceIdSchema,
  CreateCategoryInput,
  GetCategoryInput,
  GetCategoriesByInstanceIdInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
  DeleteCategoriesByInstanceIdInput,
} from "../validators/categoryValidator";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
const categoryRoutes = new Hono();

// Create a new category
categoryRoutes.post(
  "/",
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
          "application/json": { schema: resolver(createCategorySchema) },
        },
      },
      401: {
        description: "Unauthorized - Admin access required",
        content: {
          "application/json": { schema: resolver(createCategorySchema) },
        },
      },
      404: {
        description: "User Id not found",
        content: {
          "application/json": { schema: resolver(createCategorySchema) },
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
  },
);

// Get a category by ID
categoryRoutes.get(
  "/:id",
  describeRoute({
    description: "Get category by id",
    responses: {
      200: {
        description: "Success getting category",
        content: {
          "application/json": { schema: resolver(getCategorySchema) },
        },
      },
      404: {
        description: "Category id not found",
        content: {
          "application/json": { schema: resolver(getCategorySchema) },
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
  },
);

// Get all categories by instance ID
categoryRoutes.get(
  "/instance/:instanceId",
  describeRoute({
    description: "Get all categories by instance id",
    responses: {
      200: {
        description: "Success getting all categories in instance",
        content: {
          "application/json": {
            schema: resolver(getCategoriesByInstanceIdSchema),
          },
        },
      },
      400: {
        description: "Bad Request - Missing instance ID",
        content: {
          "application/json": {
            schema: resolver(getCategoriesByInstanceIdSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const instanceId = c.req.param("instanceId");
    if (!instanceId) {
      return c.json({ error: "No instance id provided" }, 400);
    }

    const categoryData = await fetchCategoriesByInstance(instanceId);
    if (categoryData) {
      return c.json(categoryData);
    } else {
      return c.json(
        { error: "Error getting all categories from instance" },
        500,
      );
    }
  },
);

// Update a category
categoryRoutes.put(
  "/:id",
  describeRoute({
    description: "Update an existing category",
    responses: {
      200: {
        description: "Success updating category",
        content: {
          "application/json": { schema: resolver(updateCategorySchema) },
        },
      },
      400: {
        description: "Bad Request - Invalid input data",
        content: {
          "application/json": { schema: resolver(updateCategorySchema) },
        },
      },
      401: {
        description: "Unauthorized - Admin access required",
        content: {
          "application/json": { schema: resolver(updateCategorySchema) },
        },
      },
      404: {
        description: "Category id or User Id not found",
        content: {
          "application/json": { schema: resolver(updateCategorySchema) },
        },
      },
    },
  }),
  zValidator("json", updateCategorySchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json") as UpdateCategoryInput;

    // Ensure the ID in the path matches the one in the body
    if (data.id && data.id !== id) {
      return c.json({ error: "ID in path does not match ID in body" }, 400);
    }

    // Set ID from path if not in body
    if (!data.id) {
      data.id = id;
    }

    const categoryData = await updateExistingCategory(data);
    if (categoryData) {
      return c.json(categoryData);
    } else {
      return c.json({ error: "Failed to update category" }, 400);
    }
  },
);

// Delete a specific category
categoryRoutes.delete(
  "/:id",
  describeRoute({
    description: "Delete an existing category",
    responses: {
      200: {
        description: "Success deleting category",
        content: {
          "application/json": { schema: resolver(deleteCategorySchema) },
        },
      },
      400: {
        description: "Bad Request - Invalid input data",
        content: {
          "application/json": { schema: resolver(deleteCategorySchema) },
        },
      },
      401: {
        description: "Unauthorized - Admin access required",
        content: {
          "application/json": { schema: resolver(deleteCategorySchema) },
        },
      },
      404: {
        description: "Category id or User Id not found",
        content: {
          "application/json": { schema: resolver(deleteCategorySchema) },
        },
      },
    },
  }),
  zValidator("json", deleteCategorySchema),
  async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json") as DeleteCategoryInput;

    // Ensure the ID in the path matches the one in the body
    if (data.id !== id) {
      return c.json({ error: "ID in path does not match ID in body" }, 400);
    }

    const categoryData = await deleteExistingCategory(data);
    if (categoryData) {
      return c.json(categoryData);
    } else {
      return c.json({ error: "Failed to delete category" }, 400);
    }
  },
);

// Delete all categories by instance ID
categoryRoutes.delete(
  "/instance/:instanceId",
  describeRoute({
    description: "Delete all categories by instance id",
    responses: {
      200: {
        description: "Success deleting all categories in instance",
        content: {
          "application/json": {
            schema: resolver(deleteCategoriesByInstanceIdSchema),
          },
        },
      },
      400: {
        description: "Bad Request - Invalid input data",
        content: {
          "application/json": {
            schema: resolver(deleteCategoriesByInstanceIdSchema),
          },
        },
      },
      401: {
        description: "Unauthorized - Admin access required",
        content: {
          "application/json": {
            schema: resolver(deleteCategoriesByInstanceIdSchema),
          },
        },
      },
      404: {
        description: "Instance id or User Id not found",
        content: {
          "application/json": {
            schema: resolver(deleteCategoriesByInstanceIdSchema),
          },
        },
      },
    },
  }),
  zValidator("json", deleteCategoriesByInstanceIdSchema),
  async (c) => {
    const instanceId = c.req.param("instanceId");
    const data = c.req.valid("json") as DeleteCategoriesByInstanceIdInput;

    // Ensure the instanceId in the path matches the one in the body
    if (data.instanceId !== instanceId) {
      return c.json(
        { error: "Instance ID in path does not match Instance ID in body" },
        400,
      );
    }

    const categoryData = await deleteAllCategoriesByInstance(data);
    if (categoryData) {
      return c.json(categoryData);
    } else {
      return c.json({ error: "Failed to delete categories" }, 400);
    }
  },
);

export { categoryRoutes };
