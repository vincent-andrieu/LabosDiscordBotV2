FROM debian:10.8-slim

COPY ./* /app/
WORKDIR /app
RUN mv ./labosdiscordbotv2-server server-bin
RUN chmod +x server-bin

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD ./server-bin