import { ITokenPayload } from './user';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export {};
