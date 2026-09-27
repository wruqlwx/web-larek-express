import { ErrorRequestHandler, RequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MulterError } from 'multer';
import { isCelebrateError } from 'celebrate';
import AbstractApiError from '../errors/abstract';
import BadRequestError from '../errors/bad-request';
import InternalServerError from '../errors/internal-server';
import NotFoundError from '../errors/not-found';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
};

const getCelebrateMessage = (err: Error & { details: Map<string, { message?: string }> }) => {
  const { details } = err;
  const found = details instanceof Map ? Array.from(details.values()) : [];
  const withMessage = found.find((entry) => Boolean(entry?.message));
  return withMessage?.message ?? err.message;
};

export const celebrateAdapter: ErrorRequestHandler = (err, _req, _res, next) => {
  if (isCelebrateError(err)) {
    next(new BadRequestError(getCelebrateMessage(err)));
    return;
  }
  next(err);
};

const DUPLICATE_KEY_MARKER = 'E11000';
const DUPLICATE_KEY_MESSAGE = 'Ошибка при создании сущности с уже существующим уникальным полем';

const isDuplicateKeyError = (err: Error) => err.message.includes(DUPLICATE_KEY_MARKER);
const isMalformedJsonError = (err: Error) => err instanceof SyntaxError && 'body' in err;

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({ message: `Ошибка валидации данных: ${err.message}` });
    return;
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({ message: DUPLICATE_KEY_MESSAGE });
    return;
  }

  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ message: 'Передан некорректный идентификатор' });
    return;
  }

  if (err instanceof MulterError) {
    res.status(400).json({ message: `Ошибка загрузки файла: ${err.message}` });
    return;
  }

  if (isMalformedJsonError(err)) {
    res.status(400).json({ message: 'Некорректный формат тела запроса' });
    return;
  }

  if (err instanceof AbstractApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: new InternalServerError().message });
};
