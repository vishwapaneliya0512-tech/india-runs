# Stage 1: Build Next.js app
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
# Set environmental variable to bypass build errors if any, though our pages are checked
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 2: Serve Next.js app
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]
