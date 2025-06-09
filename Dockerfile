FROM node:20

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn install
RUN yarn add @nestjs/cli

COPY . .

EXPOSE 5000

CMD ["yarn", "start:dev"]
