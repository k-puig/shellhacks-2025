import { Hono } from "hono";
import {
  fetchAllUsers,
  fetchUserData,
  createNewUser,
} from "../controller/userController";
import {
  createUserSchema,
  queryAllUsersByInstanceId,
  queryUserByIdSchema,
} from "../validators/userValidator";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, resolver } from "hono-openapi";
const userRoutes = new Hono();

userRoutes.get(
  "/:id",
  describeRoute({
    description: "Get user by id",
    responses: {
      200: {
        description: "Success getting user",
        content: {
          "application/json": { schema: resolver(queryUserByIdSchema) },
        },
      },
      404: {
        description: "User id not found",
        content: {
          "application/json": { schema: resolver(queryUserByIdSchema) },
        },
      },
    },
  }),
  zValidator("param", queryUserByIdSchema),
  async (c) => {
    const id = c.req.param("id");
    const userData = await fetchUserData(id);
    if (userData) {
      return c.json(userData);
    } else {
      return c.json({ error: "User not found" }, 404);
    }
  },
);

userRoutes.get(
  "",
  describeRoute({
    description: "Get all users by instance id",
    responses: {
      200: {
        description: "Success getting all users in instance",
        content: {
          "application/json": { schema: resolver(queryAllUsersByInstanceId) },
        },
      },
    },
  }),
  zValidator("query", queryAllUsersByInstanceId),
  async (c) => {
    const instanceId = c.req.query("instanceId");
    if (!instanceId) {
      return c.json({ error: "No instance id provided" }, 400);
    }

    const userData = await fetchAllUsers(instanceId);
    if (userData) {
      return c.json(userData);
    } else {
      return c.json({ error: "Error getting all users from instance" }, 500);
    }
  },
);

userRoutes.post(
  "",
  describeRoute({
    description: "Create a new user",
    responses: {
      201: {
        description: "Success",
        content: {
          "application/json": { schema: resolver(createUserSchema) },
        },
      },
      400: {
        description: "Bad request (user exists)",
        content: {
          "application/json": { schema: resolver(createUserSchema) },
        },
      },
    },
  }),
  zValidator("json", createUserSchema),
  async (c) => {
    try {
      const data = await c.req.json();
      const newUser = await createNewUser(data);
      if (!newUser) {
        return c.json({ error: "User already exists" }, 400);
      }
      return c.json(newUser, 201);
    } catch (error) {
      return c.json({ error: "Error creating user" }, 500);
    }
  },
);

export default userRoutes;
