import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { CronJob } from 'cron';
import config from './config';
import router from './routes';
import requestLogger from './middlewares/request-logger';
import errorLogger from './middlewares/error-logger';
import { celebrateAdapter, errorHandler, notFoundHandler } from './middlewares/error-handler';
import { clearUploadTempDir, prepareUploadDirs } from './utils/file';

const app = express();

mongoose
  .connect(config.dbAddress)
  .then(() => console.log(`Подключение к базе данных по адресу ${config.dbAddress} установлено`))
  .catch((error) => console.error('Не удалось подключиться к базе данных', error));

prepareUploadDirs();

new CronJob('0 * * * *', clearUploadTempDir);

app.use(requestLogger);
app.use(cors({ origin: config.originAllow }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(config.publicDir));

app.use(router);

app.use(notFoundHandler);
app.use(errorLogger);
app.use(celebrateAdapter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Сервер запущен на порту ${config.port}`);
});

export default app;
