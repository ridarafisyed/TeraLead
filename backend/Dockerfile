FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prisma:generate && npm run build
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy && npm run start"]
