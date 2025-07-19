import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import multipart from '@fastify/multipart';
import { extractReceiptDataFromBuffer } from '../utils/textExtraction';

export default async function extractRoutes(app: FastifyInstance) {
  await app.register(multipart);
  app.post('/upload-extract', async (request: FastifyRequest, reply: FastifyReply) => {

    try {
      // ✅ Use Fastify's file() method for single file
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Convert stream to buffer
      const buffer = await data.toBuffer();

      // Extract raw text
      const rawText = await extractReceiptDataFromBuffer(buffer);
      console.log('Extracted Text:', rawText);

      return reply.send({
        success: true,
        rawText,
        filename: data.filename
      });

    } catch (err: any) {
      console.error('OCR processing failed:', err);
      return reply.status(500).send({
        error: 'OCR processing failed',
        details: err.message
      });
    }
  });
}
