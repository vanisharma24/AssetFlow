# AssetFlow backend — Express + Prisma (PostgreSQL)
FROM node:20-slim

# Prisma needs OpenSSL present
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# generate doesn't connect; placeholder just satisfies prisma.config env() resolution
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" npx prisma generate

EXPOSE 5000

# Sync schema to the DB, then boot the API (run via tsx, same as dev)
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx src/index.ts"]
