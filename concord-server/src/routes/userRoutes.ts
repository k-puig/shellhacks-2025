import { Hono } from "hono";
import { fetchAllUsers, fetchUserData } from "../controller/userController";
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

actions.get("instance/:id/users", async (c) => {
  const instanceId = c.req.param("id");
  const userData = await fetchAllUsers(instanceId);
  if (userData) {
    return c.json(userData);
  } else {
    return c.json({ error: "Error getting all users from instance" }, 500);
  }
});

export default actions;
