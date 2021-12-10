FROM node:17.2-slim

WORKDIR /app
COPY ./ /app/
RUN mv ./labosdiscordbotv2-server server-bin
RUN chmod +x server-bin

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update
RUN apt-get install -y curl
EXPOSE 27017

CMD curl localhost:27017 || ./server-bin