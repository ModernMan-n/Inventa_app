FROM node:18-bullseye-slim

WORKDIR /usr/src/app

# OpenSSL + сертификаты (важно для Prisma)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

# важно: prisma schema до generate
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
CMD ["npm", "start"]
