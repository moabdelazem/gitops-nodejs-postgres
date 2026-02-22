import app from "./app";
import config from "./config/config";
import logger from "./utils/logger";
import pool from "./database/db";

const server = app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
});

function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await pool.end();
      logger.info("Database pool closed");
    } catch (err) {
      logger.error(err, "Error closing database pool");
    }

    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    logger.error("Forced shutdown — timed out after 10s");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
