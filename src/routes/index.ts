import { FastifyInstance } from "fastify";


import categorizeRoute from "./categorizeRoute";
import extractRoutes from "./extractRoute";
import vertexRoutes from "./vertexRoutes";

export default async function mainRoutes(app: FastifyInstance) {
  app.register(vertexRoutes, { prefix: '/api' });
  app.register(categorizeRoute, { prefix: '/api' });
  app.register(extractRoutes, { prefix: '/api' });
}