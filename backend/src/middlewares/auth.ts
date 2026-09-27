import { RequestHandler } from 'express';
import UnauthorizedError from '../errors/unauthorized';
import { isJwtError, verifyToken } from '../utils/token';
import '../interfaces/request';

const BEARER_PREFIX = 'Bearer ';

const auth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith(BEARER_PREFIX)) {
    next(new UnauthorizedError('Требуется авторизация'));
    return;
  }

  try {
    req.user = verifyToken(header.slice(BEARER_PREFIX.length));
    next();
  } catch (error) {
    if (isJwtError(error)) {
      next(new UnauthorizedError('Токен доступа недействителен или истёк'));
      return;
    }
    next(new UnauthorizedError('Некорректный токен доступа'));
  }
};

export default auth;
