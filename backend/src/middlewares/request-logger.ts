import expressWinston from 'express-winston';
import winston from 'winston';

const requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
  ],
  format: winston.format.json(),
});

export default requestLogger;
