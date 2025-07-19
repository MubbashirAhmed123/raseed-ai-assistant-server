import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import multipart from '@fastify/multipart';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { execFile } from 'child_process';

import { extractReceiptDataFromBuffer } from '../utils/textExtraction';
import { categorize } from '../services/categorize';
import { extractJsonFromResponse } from '../utils/extractJson';
import { receiptExtractionResponseStringify } from '../constants/catergorizeStructure';

// NPM-provided ffmpeg & ffprobe
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const FFMPEG_CMD = ffmpegInstaller.path;
const FFPROBE_CMD = ffprobeInstaller.path;

// --- helpers ---
function execFileP(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) {
        err.message += ` | stderr: ${stderr}`;
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

async function probeVideo(filePath: string) {
  try {
    const json = await execFileP(FFPROBE_CMD, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-show_format',
      filePath
    ]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function extractFrame(filePath: string, t: number, outPath: string) {
  await execFileP(FFMPEG_CMD, [
    '-ss', t.toString(),
    '-i', filePath,
    '-vframes', '1',
    '-qscale:v', '2',
    '-y',
    outPath
  ]);
}

async function safeUnlink(p?: string | null) {
  if (!p) return;
  try { await fs.promises.unlink(p); } catch { /* ignore */ }
}

export default async function extractRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 40 * 1024 * 1024
    }
  });

  app.post('/upload-extract', async (request: FastifyRequest, reply: FastifyReply) => {
    let storedVideoPath: string | null = null;  // track video for cleanup
    let framePath: string | null = null;        // track frame for cleanup (already deleted early but double-safety)

    try {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const isVideo = !!data.mimetype?.startsWith('video/');
      let ocrBuffer: Buffer;
      let videoMeta: any = null;

      if (isVideo) {
        // 1. Save video
        const videoDir = path.join(process.cwd(), 'uploads', 'videos');
        await fs.promises.mkdir(videoDir, { recursive: true });

        const ext = path.extname(data.filename || '') || '.mp4';
        const vidId = randomUUID();
        const storedName = `${vidId}${ext}`;
        storedVideoPath = path.join(videoDir, storedName);

        await new Promise<void>((res, rej) => {
          const ws = fs.createWriteStream(storedVideoPath!);
          data.file.pipe(ws);
          ws.on('finish', res);
          ws.on('error', rej);
        });

        // 2. Probe
        const probe = await probeVideo(storedVideoPath);
        const durationSec = probe?.format?.duration ? parseFloat(probe.format.duration) : 0;
        const vStream = probe?.streams?.find((s: any) => s.codec_type === 'video');
        const width = vStream?.width;
        const height = vStream?.height;

        if (durationSec && durationSec > 5.6) {
          // delete immediately & reject
          await safeUnlink(storedVideoPath);
          storedVideoPath = null;
          return reply.code(400).send({ error: `Video too long (${durationSec.toFixed(2)}s > 5.5s limit)` });
        }

        // 3. Extract frame
        const frameDir = path.join(process.cwd(), 'uploads', 'frames');
        await fs.promises.mkdir(frameDir, { recursive: true });
        framePath = path.join(frameDir, `${vidId}.jpg`);
        const targetT = durationSec
          ? Math.min(Math.max(durationSec * 0.4, 0), Math.max(durationSec - 0.05, 0))
          : 0;

        try {
          await extractFrame(storedVideoPath, targetT, framePath);
        } catch {
          await extractFrame(storedVideoPath, 0, framePath);
        }

        ocrBuffer = await fs.promises.readFile(framePath);
        // Remove frame immediately (we already have buffer)
        await safeUnlink(framePath);
        framePath = null;

        videoMeta = {
          originalFilename: data.filename,
          storedName,
          durationSec: durationSec ? Number(durationSec.toFixed(3)) : null,
            dimensions: width && height ? { width, height } : null,
          frameSourceTime: targetT
        };
      } else {
        // Non-video: original path
        ocrBuffer = await data.toBuffer();
      }

      // OCR
      const rawText = await extractReceiptDataFromBuffer(ocrBuffer);

      // Categorize
      const categorization = await categorize((rawText as string) || '');

      // JSON extraction
      let parsedCategorization = extractJsonFromResponse(categorization as string);
      if (!parsedCategorization) {
        parsedCategorization = {
          categories: {},
          summary: { total_categories: 0, total_items: 0 }
        };
      }

      const responseData = {
        success: true,
        filename: data.filename || 'unknown',
        isVideo,
        video: videoMeta,
        categorization: parsedCategorization
      };

      const serialized = receiptExtractionResponseStringify(responseData);

      reply.type('application/json');
      return reply.send(serialized);

    } catch (err: any) {
      request.log.error({ err }, 'Upload / OCR failed');
      return reply.status(500).send({
        error: 'OCR processing failed',
        details: err.message
      });
    } finally {
      // ALWAYS try to delete the video & any leftover frame
      await safeUnlink(storedVideoPath);
      await safeUnlink(framePath);
    }
  });
}