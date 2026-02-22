# Install only production dependencies
FROM node:25-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Build TypeScript output
FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

# Distroless runtime image
FROM gcr.io/distroless/nodejs24-debian12 AS runner
WORKDIR /app

# Runtime artifacts needed by app and migration job
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY migrations ./migrations
COPY package*.json ./

EXPOSE 6767

# Distroless node image already uses `node` as entrypoint
CMD ["dist/server.js"]
