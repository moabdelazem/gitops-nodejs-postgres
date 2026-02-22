import pinoHttp from "pino-http";
import logger from "../utils/logger";

export const requestLogger = pinoHttp({
  logger,
  customLogLevel(_req, res, err) {
    if (err || (res.statusCode && res.statusCode >= 500)) return "error";
    if (res.statusCode && res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage(req, _res, err) {
    return `${req.method} ${req.url} - ${err.message}`;
  },
});
