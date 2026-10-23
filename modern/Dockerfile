# Production Dockerfile for Silicon Trading Modern (Next.js + PGlite)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8090
ENV HOSTNAME="0.0.0.0"

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy application files and built bundle
COPY . .
RUN npm run build

EXPOSE 8090

CMD ["npm", "start"]
