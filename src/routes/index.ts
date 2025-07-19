import { FastifyInstance } from "fastify";
import vertexRoutes from "./testRoutes";
import extractRoutes from "./extractRoute";

export default async function mainRoutes(app: FastifyInstance) {
  app.register(vertexRoutes, { prefix: '/api' });

  app.register(extractRoutes, { prefix: '/api' });

}
