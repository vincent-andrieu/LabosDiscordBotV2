FROM node:17.2-slim

WORKDIR /app
COPY ./* /app/

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN npm run rebuild

CMD npm run run