import jwt from 'jsonwebtoken';
import ms, { StringValue } from 'ms';
import config from '../config';
import { IRefreshToken, ITokenPayload, IUserPublic } from '../interfaces/user';

const sameSiteLax = 'lax' as const;

export const getPublicUser = (user: { email: string; name?: string }): IUserPublic => ({
  email: user.email,
  ...(user.name ? { name: user.name } : {}),
});

export const generateTokens = (_id: string) => ({
  accessToken: jwt.sign(
    { _id },
    config.jwtSecret,
    { expiresIn: config.accessTokenExpiry as StringValue },
  ),
  refreshToken: jwt.sign(
    { _id },
    config.jwtSecret,
    { expiresIn: config.refreshTokenExpiry as StringValue },
  ),
});

export const verifyToken = (token: string) => (
  jwt.verify(token, config.jwtSecret) as ITokenPayload
);

export const isJwtError = (err: unknown) => (
  err instanceof jwt.TokenExpiredError
  || err instanceof jwt.JsonWebTokenError
);

export const findTokenIndex = (token: string, tokens: IRefreshToken[] = []) => (
  tokens.findIndex((item) => item.token === token)
);

export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: sameSiteLax,
  secure: false,
  maxAge: ms(config.refreshTokenExpiry as StringValue),
  path: '/',
};

export const clearRefreshCookieOptions = {
  httpOnly: true,
  sameSite: sameSiteLax,
  secure: false,
  path: '/',
};
