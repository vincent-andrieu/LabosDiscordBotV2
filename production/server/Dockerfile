FROM debian:10.8-slim

COPY ./labosdiscordbotv2-server /app/server-bin
WORKDIR /app
RUN chmod +x server-bin
CMD ./server-bin