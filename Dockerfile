FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4173"]
