import Fastify from 'fastify';
import mainRoutes from './routes';

const app = Fastify({ logger: true });

app.get('/', async () => {
  return { status: 'ok' };
});

app.register(mainRoutes);

export default app;
