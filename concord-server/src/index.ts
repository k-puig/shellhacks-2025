import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import routes from "./routes/index";
import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";
import { registerSocketHandlers } from "./sockets";

// Routes
const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://concord.kpuig.net"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Origin",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.route("/api", routes);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      servers: [{ url: "http://localhost:3000", description: "Local Server" }],
    },
  }),
);

app.get("/scalar", Scalar({ url: "/openapi" }));

// initialize socket.io server
const io = new Server({
  cors: {
    origin: ["http://localhost:5173", "https://concord.kpuig.net"],
    credentials: true,
  },
});
const engine = new Engine();
io.bind(engine);

// Register socket.io events
registerSocketHandlers(io);

const { websocket } = engine.handler();

export default {
  port: 3000,
  idleTimeout: 30, // must be greater than the "pingInterval" option of the engine, which defaults to 25 seconds

  async fetch(req: Request, server: Bun.Server) {
    const url = new URL(req.url);

    if (url.pathname === "/socket.io/") {
      const response = await engine.handleRequest(req, server);
      // Add CORS headers explicitly
      const origin = req.headers.get("Origin");
      if (
        origin &&
        ["http://localhost:5173", "https://concord.kpuig.net"].includes(origin)
      ) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
      response.headers.set("Access-Control-Allow-Credentials", "true");
      return response;
    } else {
      return app.fetch(req, server);
    }
  },

  websocket,
};
