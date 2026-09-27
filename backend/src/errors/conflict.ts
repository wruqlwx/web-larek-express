import AbstractApiError from './abstract';

class ConflictError extends AbstractApiError {
  constructor(message = 'Ошибка при создании сущности с уже существующим уникальным полем') {
    super(message, 409);
  }
}

export default ConflictError;
