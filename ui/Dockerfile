FROM node:21

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

CMD npm run start
