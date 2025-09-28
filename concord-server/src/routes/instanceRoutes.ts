import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import {
  createInstanceRequestSchema,
  getAllInstancesResponseSchema,
} from "../validators/instanceValidator";
import { zValidator } from "@hono/zod-validator";
import {
  createInstanceReq,
  getAllInstancesReq,
} from "../controller/instanceController";

const instanceRoutes = new Hono();

instanceRoutes.post(
  "",
  describeRoute({
    description: "Create instance",
    responses: {
      200: {
        description: "Instance created",
        content: {
          "application/json": { schema: resolver(createInstanceRequestSchema) },
        },
      },
      400: {
        description: "Invalid request",
      },
    },
  }),
  zValidator("json", createInstanceRequestSchema),
  async (c) => {
    const data = await c.req.json();
    if (!data) {
      return c.json({ error: "could not parse data" }, 400);
    }

    const instance = await createInstanceReq(data);
    return c.json(instance, 201);
  },
);

instanceRoutes.get(
  "",
  describeRoute({
    description: "Get all instances",
    responses: {
      200: {
        description: "List of all instances",
        content: {
          "application/json": {
            schema: resolver(getAllInstancesResponseSchema),
          },
        },
      },
      500: {
        description: "Server error",
      },
    },
  }),
  async (c) => {
    const instances = await getAllInstancesReq();
    if (instances.success) {
      return c.json(instances, 200);
    } else {
      return c.json(
        {
          success: false,
          error: instances.error || "Failed to fetch instances",
        },
        500,
      );
    }
  },
);

export default instanceRoutes;
