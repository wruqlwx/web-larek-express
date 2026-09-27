import AbstractApiError from './abstract';

class BadRequestError extends AbstractApiError {
  constructor(message = 'Ошибка валидации данных') {
    super(message, 400);
  }
}

export default BadRequestError;
