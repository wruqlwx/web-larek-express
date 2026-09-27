import AbstractApiError from './abstract';

class UnauthorizedError extends AbstractApiError {
  constructor(message = 'Ошибка аутентификации') {
    super(message, 401);
  }
}

export default UnauthorizedError;
