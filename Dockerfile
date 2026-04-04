FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Instalar TODAS as deps (incluindo dev) para prisma generate funcionar
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Rodar db push no build (tem acesso ao DATABASE_URL via Railway build args)
# Se falhar aqui, roda no CMD antes do start

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
