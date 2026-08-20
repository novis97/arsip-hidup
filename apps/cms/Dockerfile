FROM node:26-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS runner
ENV NODE_ENV=production
ENV DATABASE_URI=file:/data/payload.db
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Jangan jalankan sebagai root.
RUN addgroup -g 1001 ahi && adduser -D -u 1001 -G ahi ahi \
 && mkdir -p /data && chown -R ahi:ahi /data
USER ahi

EXPOSE 3000
CMD ["sh", "-c", "pnpm migrate && pnpm start"]
