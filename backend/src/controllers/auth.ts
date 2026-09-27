import { NextFunction, Request, Response } from 'express';
import { HydratedDocument, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user';
import BadRequestError from '../errors/bad-request';
import NotFoundError from '../errors/not-found';
import UnauthorizedError from '../errors/unauthorized';
import {
  ILoginDto,
  IRefreshToken,
  IRegisterDto,
  ITokenPayload,
  IUser,
} from '../interfaces/user';
import '../interfaces/request';
import {
  clearRefreshCookieOptions,
  findTokenIndex,
  generateTokens,
  getPublicUser,
  isJwtError,
  refreshCookieOptions,
  verifyToken,
} from '../utils/token';

const SALT_ROUNDS = 10;
const REFRESH_COOKIE = 'refreshToken';

const toObjectId = (id: string) => {
  if (!id || !Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Некорректный идентификатор пользователя');
  }
  return new Types.ObjectId(id);
};

type UserDocument = HydratedDocument<IUser>;

const issueTokens = async (res: Response, user: UserDocument) => {
  const { accessToken, refreshToken } = generateTokens(String(user._id));
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);

  const stored: IRefreshToken[] = [...(user.tokens ?? []), { token: refreshToken }];
  user.set('tokens', stored);
  await user.save();

  return { user: getPublicUser(user), accessToken };
};

const readRefreshToken = (req: Request) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token || typeof token !== 'string') {
    throw new UnauthorizedError('Refresh-токен не передан');
  }
  return token;
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body as IRegisterDto;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create({
      name: name || undefined,
      email,
      password: hashedPassword,
    });

    res.status(201).json(await issueTokens(res, user));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as ILoginDto;

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Неверный email или пароль');
    }

    res.json(await issueTokens(res, user));
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readRefreshToken(req);

    let payload: ITokenPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      if (isJwtError(error)) {
        throw new UnauthorizedError('Refresh-токен недействителен или истёк');
      }
      throw error;
    }

    const userId = toObjectId(payload._id);
    const user = await UserModel.findById(userId).select('+tokens');
    if (!user) {
      throw new NotFoundError('Пользователь с переданным _id не найден');
    }

    const tokens = user.tokens ?? [];
    const tokenIndex = findTokenIndex(token, tokens);
    if (tokenIndex === -1) {
      throw new UnauthorizedError('Refresh-токен не найден в списке пользователя');
    }

    const { accessToken, refreshToken } = generateTokens(userId.toString());

    tokens.splice(tokenIndex, 1);
    tokens.push({ token: refreshToken });
    user.set('tokens', tokens);
    await user.save();

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    res.json({ user: getPublicUser(user), accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = readRefreshToken(req);

    let payload: ITokenPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      if (isJwtError(error)) {
        throw new UnauthorizedError('Refresh-токен недействителен или истёк');
      }
      throw error;
    }

    const userId = toObjectId(payload._id);
    const user = await UserModel.findById(userId).select('+tokens');
    if (!user) {
      throw new NotFoundError('Пользователь с переданным _id не найден');
    }

    const tokens = user.tokens ?? [];
    const tokenIndex = findTokenIndex(token, tokens);
    if (tokenIndex !== -1) {
      tokens.splice(tokenIndex, 1);
      user.set('tokens', tokens);
      await user.save();
    }

    res.clearCookie(REFRESH_COOKIE, clearRefreshCookieOptions);
    res.json({ message: 'Выход выполнен' });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Требуется авторизация');
    }

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      throw new NotFoundError('Пользователь с переданным _id не найден');
    }

    res.json(getPublicUser(user));
  } catch (error) {
    next(error);
  }
};
