FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# BACKEND_URL is read by next.config.js rewrites() at build time, so it must be
# set here for the production rewrite to point at the backend service.
ARG BACKEND_URL=http://backend:8000
ENV BACKEND_URL=$BACKEND_URL
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start"]
