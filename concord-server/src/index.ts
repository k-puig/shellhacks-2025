import { Hono } from "hono";
import { cors } from "hono/cors";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import routes from "./routes/index";
import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";

//initialize socket.io server
const io = new Server();

//initialize bun engine
//then bind to socket.io server
const engine = new Engine();
io.bind(engine);
/*
io.on("connection", (socket) => {
  //get userId and clientId from query params
  const userId = socket.handshake.query.userId
  const clientId = socket.handshake.query.clientId
  if (!userId || Array.isArray(userId)) {
    socket.disconnect();
    throw new Error("Invalid user ID");
  }

  if (!clientId || Array.isArray(clientId)) {
    socket.disconnect();
    throw new Error("Invalid client ID");
  }


  socket.join(userId);
  console.log(
    `User ${userId} connected. Client ID ${clientId} on socket ${socket.id}`,
  )

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected from socket ${socket.id}`);
  })
});
*/

io.on("ping", (socket) => {
  console.log(`New client connected: ${socket.id}`)
  socket.emit("pong", socket. )
})


const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowHeaders: ["Content-Type", "Authorization"],
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

export default app;
