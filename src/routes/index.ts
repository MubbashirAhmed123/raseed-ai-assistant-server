import { FastifyInstance } from "fastify";
import vertexRoutes from "./testRoutes";
import { categorize } from "../services/categorize";
import categorizeRoute from "./categorizeRoute";

export default async function mainRoutes(app: FastifyInstance) {
  app.register(vertexRoutes, { prefix: '/api' });
  app.register(categorizeRoute, { prefix: '/api' });
}
