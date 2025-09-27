import { Hono } from "hono";
import { fetchAllUsers, fetchUserData, createNewUser } from "../controller/userController";
import { createUserSchema } from "../validators/userValidator";
import { zValidator } from "@hono/zod-validator";
import { describeRoute, resolver } from "hono-openapi";
const actions = new Hono();

actions.get("user/:id", async (c) => {
  const id = c.req.param("id");
  const userData = await fetchUserData(id);
  if (userData) {
    return c.json(userData);
  } else {
    return c.json({ error: "User not found" }, 404);
  }
});

actions.get("user", async (c) => {
  const instanceId = c.req.query("instance_id");
  if (!instanceId) {
    return c.json({ error: "No instance id provided" }, 400);
  }

  const userData = await fetchAllUsers(instanceId);
  if (userData) {
    return c.json(userData);
  } else {
    return c.json({ error: "Error getting all users from instance" }, 500);
  }
});

actions.post(
  "user",
  describeRoute({
    description: "Create a new user",
    responses: {
      201: {
        description: "Success",
        content: {
          'application/json': { schema: resolver(createUserSchema) },
        },
      }
    }
  }),
  zValidator('json', createUserSchema),
  async (c) => {
    try {
      const data = await c.req.json();
      const newUser = await createNewUser(data);
      return c.json(newUser, 201);
    } catch (error) {
      return c.json({ error: "Error creating user" }, 500);
    }
  }
);

export default actions;
