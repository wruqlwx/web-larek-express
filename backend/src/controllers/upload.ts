import path from 'path';
import { NextFunction, Request, Response } from 'express';
import config from '../config';
import BadRequestError from '../errors/bad-request';
import { IProductImage } from '../interfaces/product';

const UPLOAD_URL_PREFIX = `/${config.uploadDirName}`;

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Файл не был передан');
    }

    const fileName = path.basename(req.file.filename);

    const payload: IProductImage = {
      fileName: `${UPLOAD_URL_PREFIX}/${fileName}`,
      originalName: path.basename(req.file.originalname),
    };

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

export default uploadFile;
