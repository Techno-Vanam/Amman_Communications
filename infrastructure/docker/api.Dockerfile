FROM node:20-alpine AS base
WORKDIR /workspace
RUN corepack enable

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages ./packages
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY prisma ./prisma
COPY apps/api ./apps/api
RUN pnpm db:generate && pnpm --filter @repo/api build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/apps/api/dist ./dist
COPY --from=build /workspace/prisma ./prisma
EXPOSE 3003
CMD ["node", "dist/main"]
