FROM node:18-bullseye-slim

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl libssl1.1 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate --schema ./prisma/schema.prisma

COPY src ./src

CMD ["npm", "start"]
