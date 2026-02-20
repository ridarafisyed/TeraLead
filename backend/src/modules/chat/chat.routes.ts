import { MessageRole } from '@prisma/client';
import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { validate } from '../../middleware/validate.js';
import { aiProvider } from '../../providers/index.js';
import { HttpError } from '../../utils/http.js';
import { createChatSchema, listMessagesSchema } from './chat.schemas.js';

export const chatRouter = Router();

chatRouter.get('/patients/:id/messages', validate(listMessagesSchema), async (req, res, next) => {
  try {
    const patientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: req.auth!.sub },
      select: { id: true }
    });

    if (!patient) {
      throw new HttpError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    }

    const limitRaw = req.query.limit;
    const limit = typeof limitRaw === 'string' ? Number(limitRaw) : 50;
    const items = await prisma.message.findMany({
      where: { patientId },
      orderBy: { createdAt: 'asc' },
      take: limit
    });

    res.json({ items });
  } catch (error) {
    next(error);
  }
});

chatRouter.post('/chat', validate(createChatSchema), async (req, res, next) => {
  try {
    const { patientId, message } = req.body;
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: req.auth!.sub },
      select: { id: true, name: true, medicalNotes: true }
    });

    if (!patient) {
      throw new HttpError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    }

    await prisma.message.create({
      data: {
        patientId,
        role: MessageRole.USER,
        content: message
      }
    });

    const reply = await aiProvider.generate({
      message,
      patientContext: {
        name: patient.name,
        medicalNotes: patient.medicalNotes
      }
    });

    await prisma.message.create({
      data: {
        patientId,
        role: MessageRole.AI,
        content: reply
      }
    });

    res.json({ reply });
  } catch (error) {
    next(error);
  }
});
