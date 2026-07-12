# AssetFlow frontend — Next.js 16
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Baked into the client bundle at build time. Points at the backend URL the
# BROWSER reaches (published on the host), not the compose service name.
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
