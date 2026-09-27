import AbstractApiError from './abstract';

class NotFoundError extends AbstractApiError {
  constructor(message = 'Маршрут не найден') {
    super(message, 404);
  }
}

export default NotFoundError;
