import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { validate } from '../../middleware/validate.js';
import { HttpError } from '../../utils/http.js';
import {
  createPatientSchema,
  listPatientsSchema,
  patientIdSchema,
  updatePatientSchema
} from './patient.schemas.js';

export const patientRouter = Router();

patientRouter.get('/', validate(listPatientsSchema), async (req, res, next) => {
  try {
    const pageRaw = req.query.page;
    const limitRaw = req.query.limit;
    const page = typeof pageRaw === 'string' ? Number(pageRaw) : 1;
    const limit = typeof limitRaw === 'string' ? Number(limitRaw) : 10;
    const userId = req.auth!.sub;

    const [items, total] = await prisma.$transaction([
      prisma.patient.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.patient.count({ where: { userId } })
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
});

patientRouter.post('/', validate(createPatientSchema), async (req, res, next) => {
  try {
    const patient = await prisma.patient.create({
      data: {
        ...req.body,
        userId: req.auth!.sub
      }
    });

    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

patientRouter.get('/:id', validate(patientIdSchema), async (req, res, next) => {
  try {
    const patientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, userId: req.auth!.sub }
    });

    if (!patient) {
      throw new HttpError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
});

patientRouter.put('/:id', validate(updatePatientSchema), async (req, res, next) => {
  try {
    const patientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await prisma.patient.findFirst({
      where: { id: patientId, userId: req.auth!.sub },
      select: { id: true }
    });

    if (!existing) {
      throw new HttpError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    }

    const patient = await prisma.patient.update({
      where: { id: patientId },
      data: req.body
    });

    res.json(patient);
  } catch (error) {
    next(error);
  }
});

patientRouter.delete('/:id', validate(patientIdSchema), async (req, res, next) => {
  try {
    const patientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await prisma.patient.deleteMany({
      where: { id: patientId, userId: req.auth!.sub }
    });

    if (deleted.count === 0) {
      throw new HttpError(404, 'PATIENT_NOT_FOUND', 'Patient not found');
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
