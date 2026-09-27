import AbstractApiError from './abstract';

class InternalServerError extends AbstractApiError {
  constructor(message = 'Произошла непредвиденная ошибка на сервере') {
    super(message, 500);
  }
}

export default InternalServerError;
