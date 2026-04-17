FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/

USER appuser
EXPOSE $PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:$PORT/api/v1/health || exit 1

CMD ["node", "src/server.js"]
