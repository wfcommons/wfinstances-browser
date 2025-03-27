FROM node:21

COPY package.json .

RUN npm install -g npm@10.9.1
RUN npm install --force

COPY . .

RUN npm run build

ARG WFINSTANCES_UI_PORT

CMD PORT=${WFINSTANCES_UI_PORT} npm run start
