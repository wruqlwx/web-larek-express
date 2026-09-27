abstract class AbstractApiError extends Error {
  protected constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = new.target.name;
  }
}

export default AbstractApiError;
