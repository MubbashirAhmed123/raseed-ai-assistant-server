import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import multipart from '@fastify/multipart';
import { extractReceiptDataFromBuffer } from '../utils/textExtraction';
import { categorize } from '../services/categorize';
import { receiptExtractionResponseStringify } from '../contants/catergorizeStructure';
import { extractJsonFromResponse } from '../utils/extractJson';


export default async function extractRoutes(app: FastifyInstance) {
  await app.register(multipart);



  app.post('/upload-extract', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const buffer = await data.toBuffer();
      const rawText = await extractReceiptDataFromBuffer(buffer);
      console.log('Extracted Text:', rawText);

      const categorization = await categorize(rawText as string || '');
      console.log('Categorization Result:', categorization);

      // ✅ Use the robust JSON extraction function
      let parsedCategorization = extractJsonFromResponse(categorization as string);

      if (!parsedCategorization) {
        console.log('JSON extraction failed, using fallback');
        parsedCategorization = {
          categories: {},
          summary: { total_categories: 0, total_items: 0 }
        };
      }

      // ✅ Prepare and serialize response with fast-json-stringify
      const responseData = {
        success: true,
        categorization: parsedCategorization,
        filename: data.filename || 'unknown'
      };

      const serializedResponse = receiptExtractionResponseStringify(responseData);

      console.log('Serialized Response:', serializedResponse);

      reply.type('application/json');
      return reply.send(serializedResponse);

    } catch (err: any) {
      console.error('OCR processing failed:', err);
      return reply.status(500).send({
        error: 'OCR processing failed',
        details: err.message
      });
    }
  });
}
