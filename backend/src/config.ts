import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT ?? 3000),
  dbAddress: process.env.DB_ADDRESS ?? 'mongodb://127.0.0.1:27017/weblarek',
  jwtSecret: process.env.JWT_SECRET ?? 'web-larek-express-dev-secret',
  accessTokenExpiry: process.env.AUTH_ACCESS_TOKEN_EXPIRY ?? '10m',
  refreshTokenExpiry: process.env.AUTH_REFRESH_TOKEN_EXPIRY ?? '7d',
  originAllow: process.env.ORIGIN_ALLOW ?? 'http://localhost:5173',
  publicDir: path.join(__dirname, 'public'),
  uploadDirName: process.env.UPLOAD_PATH ?? 'images',
  uploadTempDirName: process.env.UPLOAD_PATH_TEMP ?? 'temp',
  uploadLimitFileSize: 3 * 1024 * 1024,
};

export const uploadDir = path.join(config.publicDir, config.uploadDirName);
export const uploadTempDir = path.join(__dirname, config.uploadTempDirName);

export default config;
