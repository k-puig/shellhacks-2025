//place exported routes below this line
import { Hono } from "hono";
import userRoutes from "./userRoutes";
import messageRoutes from "./messageRoutes";
import { channelRoutes } from "./channelRoutes";
import instanceRoutes from "./instanceRoutes";
import { categoryRoutes } from "./categoryRoutes";
import realtimeRoutes from "./realtimeRoutes";

const routes = new Hono();

routes.route("/user", userRoutes);
routes.route("/message", messageRoutes);
routes.route("/channel", channelRoutes);
routes.route("/instance", instanceRoutes);
routes.route("/category", categoryRoutes);
routes.route("/realtime", realtimeRoutes);

export default routes;
