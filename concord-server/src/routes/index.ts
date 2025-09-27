//place exported routes below this line
import { Hono } from "hono";
import userRoutes from "./userRoutes";
import messageRoutes from "./messageRoutes";

const routes = new Hono();

routes.route("/user", userRoutes);
routes.route("/message", messageRoutes);

export default routes;
