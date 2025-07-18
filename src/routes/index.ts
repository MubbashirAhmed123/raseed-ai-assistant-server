import { FastifyInstance } from "fastify";
import vertexRoutes from "./testRoutes";

export default async function mainRoutes(app: FastifyInstance) {
  app.register(vertexRoutes, { prefix: '/api' });
}
