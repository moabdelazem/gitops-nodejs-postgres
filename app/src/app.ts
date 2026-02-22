import express from "express";
import { notFoundHandler } from "./middlewares/not-found.middleware";
import { errorHandler } from "./middlewares/error-handler.middleware";
import { requestLogger } from "./middlewares/request-logger.middleware";
import healthRoutes from "./routes/health.routes";
import itemRoutes from "./routes/item.routes";

const app = express();

// Body parsing json requests
app.use(express.json());
// Request logging
app.use(requestLogger);

app.use("/health", healthRoutes);
app.use("/api/items", itemRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
