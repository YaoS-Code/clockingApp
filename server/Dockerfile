FROM node:20.18.1-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 13000

CMD ["npm", "start"]