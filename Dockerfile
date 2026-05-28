FROM node:24.14-slim

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g pnpm@10.32.1
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*
COPY . .

CMD ["npm", "run", "theme:dev"]
