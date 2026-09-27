import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import config, { uploadTempDir } from '../config';

const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadTempDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
};

const fileMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.uploadLimitFileSize,
    files: 1,
  },
}).single('file');

export default fileMiddleware;
