import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { HttpError } from '../utils/http.js';

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      return next(new HttpError(400, 'VALIDATION_ERROR', parsed.error.issues.map((i) => i.message).join(', ')));
    }

    req.body = parsed.data.body;
    req.query = parsed.data.query;
    req.params = parsed.data.params;
    next();
  };
}
