//place exported routes below this line
import { Hono } from "hono";
import actions from "./userRoutes";

const routes = new Hono();

routes.route("/", actions);

export default routes;
