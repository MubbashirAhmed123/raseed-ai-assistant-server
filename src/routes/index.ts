import { FastifyInstance } from "fastify";
// import vertexRoutes from "./testRoutes";
import NotificationRoutes from "./notificationRoutes";

export default async function mainRoutes(app: FastifyInstance) {
  // app.register(vertexRoutes, { prefix: '/api' });
  app.register(NotificationRoutes, { prefix: "/api/v1/notification" });
}
