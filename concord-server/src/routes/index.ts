//place exported routes below this line
import { Hono } from "hono";
import userRoutes from "./userRoutes";
import messageRoutes from "./messageRoutes";
import channelRoutes from "./channelRoutes";

const routes = new Hono();

routes.route("/user", userRoutes);
routes.route("/message", messageRoutes);
routes.route("/channel", channelRoutes);

export default routes;
