FROM node:20-alpine AS build
WORKDIR /app
ARG BACKEND_API_URL=http://backend:8080
ENV BACKEND_API_URL=$BACKEND_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG BACKEND_API_URL=http://backend:8080
ENV BACKEND_API_URL=$BACKEND_API_URL
ENV PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
