FROM node:22-alpine

WORKDIR /app

COPY package.json scheduler.js ./
COPY tasks.json ./tasks.json

CMD ["npm", "start"]